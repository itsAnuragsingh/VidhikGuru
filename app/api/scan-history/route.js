import { NextResponse } from "next/server"
import DocumentScannerService from "@/lib/document-scanner-service"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 })
    }

    const documents = await DocumentScannerService.getUserScanHistory(userId, limit, skip)

    return NextResponse.json({
      success: true,
      data: documents,
    })
  } catch (error) {
    console.error("Scan history error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
