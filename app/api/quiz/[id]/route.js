import {  NextRequest, NextResponse } from "next/server"
import { QuizService } from "@/lib/quiz-service"

export async function GET(request, { params }) {
  try {
    const quiz = await QuizService.getQuizForTaking(params.id)
    return NextResponse.json({ success: true, data: quiz })
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ success: false, error: "Quiz not found" }, { status: 404 })
  }
}