import fs from "fs";
import path from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function getChunksFromJson() {
  const filePath = path.join(process.cwd(), "public", "Constitution.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent); // should be an array of Parts

  const documents = [];

  for (const part of jsonData) {
    const partNo = part.PartNo || "Unknown";
    const partName = part.Name || "Unknown";

    if (!part.Articles || !Array.isArray(part.Articles)) continue;

    for (const article of part.Articles) {
      const artNo = article.ArtNo || "Unknown";
      const artName = article.Name || "Unknown";
      const artDesc = article.ArtDesc?.trim();

      if (!artDesc || typeof artDesc !== "string") continue;

      documents.push({
        pageContent: artDesc,
        metadata: {
          partNo,
          partName,
          articleNo: artNo,
          articleName: artName,
        },
      });
    }
  }

  console.log("📄 Total valid articles found:", documents.length);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(documents);

  const cleanChunks = splitDocs.filter(
    (chunk) =>
      chunk.pageContent &&
      typeof chunk.pageContent === "string" &&
      chunk.pageContent.trim().length > 0
  );

  console.log("✅ Total clean chunks for embedding:", cleanChunks.length);

  return cleanChunks;
}
