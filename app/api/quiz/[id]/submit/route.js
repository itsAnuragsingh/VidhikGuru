import {  NextRequest, NextResponse } from "next/server"
import { QuizService } from "@/lib/quiz-service"

export async function POST(request, { params }) {
  try {
    const body = await request.json()
    const { userId, answers, totalTimeSpent } = body

    if (!userId || !answers || !totalTimeSpent) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const result = await QuizService.submitQuizResult({
      userId,
      quizId: params.id,
      answers,
      totalTimeSpent,
      ipAddress: request.ip,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ success: false, error: "Failed to submit quiz" }, { status: 500 })
  }
}
