import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request, { params }) {
  let client
  
  try {
    const { partno, articleno } = await params
    // Connect to MongoDB
    // client = new MongoClient(process.env.MONGODB_URI)
    // await client.connect()
    
    // // Get database and collection
    // const db = client.db()
    const { client, db } = await connectToDatabase()
    const collection = db.collection("constitution_datas")
    
    const partNo = partno
    const articleNo = articleno
    
    // Find the part
    const part = await collection.findOne({ PartNo: partNo })
    
    if (!part) {
      return NextResponse.json({ success: false, error: "Part not found" }, { status: 404 })
    }
    
    // Find the article within the part
    const article = part.Articles?.find((art) => art.ArtNo === articleNo)
    
    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        part: {
          PartNo: part.PartNo,
          Name: part.Name,
        },
        article: article,
      },
    })

  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch article" }, { status: 500 })
    
  } finally {
    if (client) {
      await client.close()
    }
  }
}
