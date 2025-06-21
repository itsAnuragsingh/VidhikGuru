import { NextResponse } from "next/server"
import DocumentScannerService from "@/lib/document-scanner-service"

export async function POST(request, { params }) {
  try {
    const { userId } = await request.json()
    const documentId = params.id

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 })
    }

    const quiz = await DocumentScannerService.generateQuizFromDocument(documentId, userId)

    return NextResponse.json({
      success: true,
      data: quiz,
    })
  } catch (error) {
    console.error("Quiz generation error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
