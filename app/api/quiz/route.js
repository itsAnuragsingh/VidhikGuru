import { NextRequest, NextResponse } from "next/server"
import { QuizService } from "@/lib/quiz-service"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    const quizzes = await QuizService.getQuizzes({
      category: category || undefined,
      difficulty: difficulty || undefined,
      isActive: true,
      limit,
      skip,
    })

    return NextResponse.json({ success: true, data: quizzes })
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch quizzes" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { topic, category, difficulty, questionCount, timeLimit, tags } = body

    if (!topic || !category || !difficulty || !questionCount || !timeLimit) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const quiz = await QuizService.createQuiz({
      topic,
      category,
      difficulty,
      questionCount,
      timeLimit,
      tags,
    })

    return NextResponse.json({ success: true, data: quiz })
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ success: false, error: "Failed to create quiz" }, { status: 500 })
  }
}