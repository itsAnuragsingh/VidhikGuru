import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'
import { RunnableSequence } from '@langchain/core/runnables'
import { PromptTemplate } from '@langchain/core/prompts'


// Global connection pool - reuse connections
let globalClient = null;
let globalDb = null;
let globalVectorStore = null;
let globalLLM = null;

// Initialize connections once
async function getConnections() {
  if (!globalClient) {
    // Validate environment variables
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI environment variable is not set')
    if (!process.env.MONGODB_DB) throw new Error('MONGODB_DB environment variable is not set')
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY environment variable is not set')

    globalClient = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  
})
    await globalClient.connect()
    globalDb = globalClient.db(process.env.MONGODB_DB)
    console.log('✅ MongoDB connected successfully')
  }

  if (!globalVectorStore) {
    const collection = globalDb.collection("constitution_embeddings")
    
    // Check if collection exists and has documents
    const docCount = await collection.countDocuments()
    console.log(`📊 Collection has ${docCount} documents`)
    
    // Check a sample document to verify structure
    const sampleDoc = await collection.findOne()
    if (sampleDoc) {
      console.log('📄 Sample document structure:', {
        hasText: !!sampleDoc.text,
        hasEmbedding: !!sampleDoc.embedding,
        textLength: sampleDoc.text ? sampleDoc.text.length : 0,
        embeddingLength: sampleDoc.embedding ? sampleDoc.embedding.length : 0,
        keys: Object.keys(sampleDoc)
      })
    }
    
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'text-embedding-004',
    })

    globalVectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection,
      indexName: 'default', // Make sure this matches your actual index name
      textKey: 'text',
      embeddingKey: 'embedding',
    })
    console.log('✅ Vector store initialized')
  }

  if (!globalLLM) {
    globalLLM = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-2.0-flash',
      temperature: 0.3,
      maxOutputTokens: 1024,
    })
    console.log('✅ LLM initialized')
  }

  return { client: globalClient, db: globalDb, vectorStore: globalVectorStore, llm: globalLLM }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { query } = body
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Valid query is required' 
      }, { status: 400 })
    }

    console.log('🔍 Processing query:', query.trim())

    const { vectorStore, llm } = await getConnections()

    // Test direct vector search first
    console.time('Vector Search')
    const retriever = vectorStore.asRetriever({
      k: 5, // Increased back to get more results
      searchKwargs: {
        fetchK: 15
      }
    })

    // Try direct retrieval with logging
    const docs = await retriever.invoke(query.trim())
    console.timeEnd('Vector Search')
    
    console.log(`📚 Retrieved ${docs ? docs.length : 0} documents`)
    
    if (docs && docs.length > 0) {
      docs.forEach((doc, index) => {
        console.log(`Doc ${index + 1}: ${doc.pageContent.substring(0, 100)}...`)
        console.log(`Doc ${index + 1} length: ${doc.pageContent.length}`)
      })
    } else {
      console.log('❌ No documents retrieved')
      
      // Fallback: Try direct MongoDB search for debugging
      const collection = globalDb.collection("constitution_embeddings")
      const textSearchResults = await collection.find(
        { text: { $regex: new RegExp(query.trim(), 'i') } }
      ).limit(3).toArray()
      
      console.log(`📝 Direct text search found ${textSearchResults.length} results`)
      
      if (textSearchResults.length > 0) {
        const fallbackContext = textSearchResults.map(doc => doc.text).join('\n\n')
        
        const prompt = PromptTemplate.fromTemplate(`
You are NyayaGPT, a legal assistant for Indian Constitutional law.

Context: {context}
query: {query}

Provide a detailed, accurate answer based on the context. Reference specific articles when applicable.

Answer:`)

        console.time('LLM Generation')
        const directResponse = await llm.invoke(
          await prompt.format({
            context: fallbackContext,
            query: query.trim()
          })
        )
        console.timeEnd('LLM Generation')

        const answer = typeof directResponse === 'string' ? directResponse : 
                      directResponse.content || directResponse.text || String(directResponse)

        return NextResponse.json({ 
          answer: answer,
          query: query.trim(),
          searchMethod: 'text-search-fallback',
          documentsFound: textSearchResults.length
        })
      }
    }

    // If we have vector search results, proceed with RAG
    if (docs && docs.length > 0) {
      const prompt = PromptTemplate.fromTemplate(`
You are **NyayaGPT**, an expert legal assistant specializing in the **Constitution of India** and **Indian laws**. Your role is to provide legally accurate, well-structured, and professionally formatted answers tailored to students, educators, and legal professionals.

---

**Context:**  
{context}

**User Query:**  
{query}

---

### 🧾 FORMATTING RULES:

1. **Use proper HTML/Markdown formatting**
   • Never use raw line breaks like \\n, \\n\\n, \\n1, \\n\\n3  
   • Use paragraph tags (<p>) or markdown spacing naturally

2. **Structure the response using clearly numbered main sections**
   • Each numbered section should address a distinct legal point or step

3. **Use bullet points (•)** for sub-points under each main section
   • Indent appropriately for clarity
   • Maintain hierarchy for sub-bullets if needed

4. **Use bold formatting** for:
   • Important legal terms  
   • Subheadings  
   • Summaries or conclusions (clearly marked)

5. **Maintain professional legal tone**
   • Use correct terminology, references, and legal phrasing  
   • Provide clarification where legal language may be complex

6. **Ensure educational value and readability**
   • Even with limited context, offer informative content  
   • Avoid redundancy; be precise, clear, and legally sound

7. **Critical Restriction:**  
   ❌ Do **not** use any of the following for formatting: \\n, **\\n**, raw line breaks, triple line breaks, asterisks (*, **) for lists, or inconsistent spacing

---

### ✅ RESPONSE FORMAT:

1. **[Section Title]**
   • [Key explanation or insight]
   • [Additional legal point if needed]

2. **[Next Section Title]**
   • ...

---

Conclude with a brief **bold summary** if appropriate.

Now generate the answer below.

some tips:
- if someone greets you, you can greet them back dont give large answers
- if someone asks you to write a poem, then say i can write a pls ask about the constitution
- dont now always introduce yourself as NyayaGPT, you can just answer the question directly by saying here is the details 
- if someone ask to give answer in one line or few words, then you can give a short answer but not always 

Answer:`)

      const ragChain = RunnableSequence.from([
        {
          context: (input) => {
            const context = docs.map((doc) => doc.pageContent).join('\n\n')
            
            return context
          },
          query: (input) => input.query,
        },
        prompt,
        llm,
      ])

      console.time('RAG Chain')
      const response = await ragChain.invoke({ query: query.trim() })
      console.timeEnd('RAG Chain')
      
      const answer = typeof response === 'string' ? response : 
                    response.content || response.text || String(response)

      return NextResponse.json({ 
        answer: answer
        // query: query.trim(),
        // searchMethod: 'vector-search',
        // documentsFound: docs.length
      })
    }

    // If no results found anywhere
    return NextResponse.json({ 
      answer: "I couldn't find relevant information about your query in the Constitution database. Please try rephrasing your query or ask about specific constitutional articles.",
      query: query.trim(),
      searchMethod: 'no-results',
      documentsFound: 0
    })

  } catch (err) {
    console.error('❌ API Error:', err)
    
    if (err.message === 'Request timeout') {
      return NextResponse.json({ 
        error: 'Request timeout. Please try again with a shorter query.' 
      }, { status: 408 })
    }
    
    if (err.message.includes('environment variable')) {
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 })
    }
    
    if (err.message.includes('MongoDB') || err.message.includes('connection')) {
      return NextResponse.json({ 
        error: 'Database connection error' 
      }, { status: 503 })
    }

    return NextResponse.json({ 
      error: 'Internal server error. Please try again later.' 
    }, { status: 500 })
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (globalClient) {
    await globalClient.close()
  }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  if (globalClient) {
    await globalClient.close()
  }
  process.exit(0)
})