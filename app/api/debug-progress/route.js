// Create: api/debug-progress/route.js

import { debugConstitutionData } from "@/models/userProgress"
import { NextResponse } from "next/server"


export async function GET(request) {
  try {
    const debugInfo = await debugConstitutionData()
    
    return NextResponse.json({
      success: true,
      debug: debugInfo
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}