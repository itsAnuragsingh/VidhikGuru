import { connectToDatabase } from "@/lib/mongodb"
import { NextResponse } from "next/server"


export async function GET(request, { params }) {
  let client
  
  try {
    const { partno } = await params
    
    // Debug logging
    console.log("Received partno:", partno, "Type:", typeof partno)
    
    // Connect to MongoDB
    // client = new MongoClient(process.env.MONGODB_URI)
    // await client.connect()
    
    // // Get database and collection
    // const db = client.db()
    const { client, db } = await connectToDatabase()
    const collection = db.collection("constitution_datas")
    
    // Debug: Check what PartNo values exist in database
    const allParts = await collection.find({}).project({ PartNo: 1 }).limit(5).toArray()
    console.log("Sample PartNo values in database:", allParts.map(p => ({ PartNo: p.PartNo, type: typeof p.PartNo })))
    
    // Try both string and number versions
    let part = await collection.findOne({ PartNo: partno })
    
    if (!part) {
      // Try converting to number if partno is string
      const partNoAsNumber = parseInt(partno)
      console.log("Trying as number:", partNoAsNumber)
      part = await collection.findOne({ PartNo: partNoAsNumber })
    }
    
    if (!part) {
      // Try as string if partno is number
      const partNoAsString = String(partno)
      console.log("Trying as string:", partNoAsString)
      part = await collection.findOne({ PartNo: partNoAsString })
    }
    
    if (!part) {
      console.log("Part not found with any conversion")
      return NextResponse.json({ 
        success: false, 
        error: `Part ${partno} not found. Available parts: ${allParts.map(p => p.PartNo).join(', ')}` 
      }, { status: 404 })
    }
    
    console.log("Found part:", part.PartNo, part.Name)
    
    return NextResponse.json({
      success: true,
      data: part,
    })

  } catch (error) {
    console.error("Error fetching part:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch part data: " + error.message 
    }, { status: 500 })
    
  } finally {
    if (client) {
      await client.close()
    }
  }
}