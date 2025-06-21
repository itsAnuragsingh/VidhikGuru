import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { message, documentContext, chatHistory } = await request.json()

    if (!message || !documentContext) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Build context for the AI
    const systemPrompt = `You are a legal AI assistant specializing in document analysis and legal education. 

DOCUMENT CONTEXT:
- Document Type: ${documentContext.documentType}
- Summary: ${documentContext.summary}
- Detected Legal Terms: ${documentContext.detectedTerms.map((term) => `${term.term}: ${term.definition}`).join("; ")}

DOCUMENT TEXT:
${documentContext.text}

INSTRUCTIONS:
1. Answer questions about this specific document
2. Explain legal terms in simple language
3. Provide educational insights about legal concepts
4. Be helpful but remind users to consult qualified lawyers for legal advice
5. Keep responses concise but informative
6. Reference specific parts of the document when relevant

USER QUESTION: ${message}`

    // Add chat history for context
    let conversationContext = ""
    if (chatHistory && chatHistory.length > 0) {
      conversationContext =
        "\n\nPREVIOUS CONVERSATION:\n" +
        chatHistory.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n")
    }

    const fullPrompt = systemPrompt + conversationContext

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const aiResponse = response.text()

    return NextResponse.json({
      success: true,
      response: aiResponse,
    })
  } catch (error) {
    console.error("AI chat error:", error)

    // Provide fallback responses for common questions
    const fallbackResponses = {
      "key terms":
        "I can see several important legal terms in this document. The main ones include the detected terms that were highlighted during scanning. Each term has specific legal significance in the context of this document type.",
      purpose:
        "Based on the document type and content, this appears to be a legal document that establishes rights, obligations, or procedures. The specific purpose depends on the document type and the parties involved.",
      rights:
        "Legal documents typically outline various rights and obligations for the parties involved. I'd recommend reviewing each section carefully and consulting with a qualified attorney for specific legal advice.",
      issues:
        "While I can help explain the content, identifying potential legal issues requires careful analysis by a qualified legal professional. I recommend having this document reviewed by an attorney.",
    }

    // Try to provide a relevant fallback response
    const userMessage = request.body?.message?.toLowerCase() || ""
    let fallbackResponse = "I'm having trouble accessing my AI capabilities right now. "

    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (userMessage.includes(key)) {
        fallbackResponse += response
        break
      }
    }

    if (fallbackResponse === "I'm having trouble accessing my AI capabilities right now. ") {
      fallbackResponse +=
        "Please try rephrasing your question, or ask about key terms, document purpose, rights and obligations, or potential legal issues."
    }

    return NextResponse.json({
      success: true,
      response:
        fallbackResponse +
        "\n\n*Note: This is a fallback response. For detailed legal analysis, please consult with a qualified attorney.*",
    })
  }
}
