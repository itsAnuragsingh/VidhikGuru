import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"


export async function GET() {
  let client
  
  try {
    // // Connect to MongoDB
    // client = new MongoClient(process.env.MONGODB_URI)
    // await client.connect()
    
    // // Get database and collection
    // const db = client.db()
     const { client, db } = await connectToDatabase()
    const collection = db.collection("constitution_datas")
    
    // Fetch data
    const parts = await collection.find({})
      .project({
        PartNo: 1,
        Name: 1,
        "Articles.ArtNo": 1,
        "Articles.Name": 1
      })
      .sort({ PartNo: 1 })
      .toArray()

    return NextResponse.json({
      success: true,
      data: parts,
    })

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch data" 
    }, { status: 500 })
    
  } 
}
