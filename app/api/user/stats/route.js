import { NextRequest, NextResponse } from "next/server"
import { QuizService } from "@/lib/quiz-service"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const stats = await QuizService.getUserStats(userId)
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user stats" }, { status: 500 })
  }
}