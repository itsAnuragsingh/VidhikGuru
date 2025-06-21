import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const getGoogleEmbeddings = () => {
  return new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001",
    apiKey: process.env.GEMINI_API_KEY,
  });
};

// ✅ This batches docs in groups (like embedDocuments)
export async function embedDocumentsInBatches(
  docs,
  embeddings,
  batchSize = 10
) {
  const results = [];

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);

    const embedded = await Promise.all(
      batch.map((doc, index) => {
        if (
          !doc.pageContent ||
          typeof doc.pageContent !== "string" ||
          doc.pageContent.trim().length === 0
        ) {
          console.error("❌ Invalid doc at index:", i + index, doc);
          throw new Error(`Chunk at index ${i + index} has invalid content`);
        }

        return embeddings.embedQuery(doc.pageContent);
      })
    );

    results.push(...embedded);
  }

  return results;
}
