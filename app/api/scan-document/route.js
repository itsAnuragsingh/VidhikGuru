import { NextResponse } from "next/server"
import DocumentScannerService from "@/lib/document-scanner-service"

export async function POST(request) {
  try {
    const { extractedText, confidence, userId } = await request.json()

    if (!extractedText || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Initialize legal terms if not already done
    await DocumentScannerService.initializeLegalTerms()

    // Process the extracted text (OCR was done on client-side)
    const ocrResult = await DocumentScannerService.processExtractedText(extractedText, confidence)

    if (!ocrResult.text.trim()) {
      return NextResponse.json({ success: false, error: "No text detected in image" }, { status: 400 })
    }

    // Detect legal terms
    const detectedTerms = await DocumentScannerService.detectLegalTerms(ocrResult.text)

    // Save to database with proper userId and placeholder image
    const savedDocument = await DocumentScannerService.saveScannedDocument(
      userId, // Pass the actual userId
      "data:image/jpeg;base64,placeholder", // Placeholder image data
      ocrResult,
      detectedTerms,
    )

    return NextResponse.json({
      success: true,
      data: {
        documentId: savedDocument._id,
        text: ocrResult.text,
        detectedTerms,
        documentType: savedDocument.documentType,
        summary: savedDocument.summary,
      },
    })
  } catch (error) {
    console.error("Document scanning error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
