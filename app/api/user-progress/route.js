// api/user-progress/route.js
import { NextResponse } from "next/server"
import { getUserProgress, markArticleAsRead } from "@/lib/userProgress"

// Get user progress
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Try to get userId from different params
    const userId = searchParams.get("userId") || 
                   searchParams.get("email") || 
                   searchParams.get("user") ||
                   "guest-user" // fallback for hackathon
    
    if (!userId || userId === "guest-user") {
      return NextResponse.json({ 
        success: false, 
        error: "User ID required. Please provide userId, email, or user parameter" 
      }, { status: 400 })
    }

    const progressData = await getUserProgress(userId)

    return NextResponse.json({
      success: true,
      data: progressData,
    })
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch user progress",
      details: error.message 
    }, { status: 500 })
  }
}

// Mark article as read
export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, email, user, partNo, articleNo, timeSpent = 0 } = body
    
    // Try to get userId from different fields
    const finalUserId = userId || email || user
    
    if (!finalUserId) {
      return NextResponse.json({ 
        success: false, 
        error: "User identification required. Please provide userId, email, or user in request body" 
      }, { status: 400 })
    }

    if (!partNo || !articleNo) {
      return NextResponse.json({ 
        success: false, 
        error: "partNo and articleNo are required" 
      }, { status: 400 })
    }

    const result = await markArticleAsRead(finalUserId, partNo, articleNo, timeSpent)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error marking article as read:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to mark article as read",
      details: error.message 
    }, { status: 500 })
  }
}