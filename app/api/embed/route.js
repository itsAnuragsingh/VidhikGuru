import { getChunksFromJson } from "@/lib/chunker";
import { connectToMongoDB } from "@/lib/mongodb";
import { getGoogleEmbeddings, embedDocumentsInBatch, embedDocumentsInBatches } from "@/lib/embedder";

export async function POST() {
  try {
    const docs = await getChunksFromJson(); // chunked + cleaned
    const embeddings = getGoogleEmbeddings();

    console.log("🔍 Total clean chunks:", docs.length);
    if (!docs.length) throw new Error("No valid chunks to embed");

    // const vectors = await embedDocumentsInBatches(docs, embeddings);
    const vectors = await embeddings.embedDocuments(
      docs.map((doc) => doc.pageContent)
    );

    console.log("✅ Vectors generated:", vectors.length);

    if (docs.length !== vectors.length) {
      throw new Error(`Mismatch: docs=${docs.length}, vectors=${vectors.length}`);
    }

    const docsToInsert = docs.map((doc, i) => ({
      text: doc.pageContent,
      metadata: doc.metadata,
      embedding: vectors[i],
    }));

    console.log("📥 Prepared docs to insert:", docsToInsert.length);

    if (!docsToInsert.length) {
      throw new Error("Nothing to insert — final batch is empty");
    }

    const collection = await connectToMongoDB();
    await collection.deleteMany({});
    await collection.insertMany(docsToInsert);

    return Response.json({ message: "Embedding completed successfully" });
  } catch (error) {
    console.error("❌ Error embedding:", error);
    return Response.json({ error: "Embedding failed", detail: error.message }, { status: 500 });
  }
}
