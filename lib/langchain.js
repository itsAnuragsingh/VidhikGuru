import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import { getGoogleEmbeddings } from "./embedder";
import { connectToMongoDB } from "./mongodb";

export async function getMongoVectorStore() {
    const collection = await connectToMongoDB();
    const embeddings = getGoogleEmbeddings();

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection,
        indexName: "default",
        textKey: "text",
        embeddingKey: "embedding",
    });

    return vectorStore;
}