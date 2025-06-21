
import { ScannedDocument, LegalTerm } from "@/models/ScannedDocument"
import { QuizService } from "./quiz-service"
import connectDB from "./db"

// Document scanner using only Tesseract.js (client-side OCR)
class DocumentScannerService {
  // Initialize legal terms database with common terms
  static async initializeLegalTerms() {
    await connectDB()

    const existingTerms = await LegalTerm.countDocuments()
    if (existingTerms > 0) return

    const commonLegalTerms = [
      {
        term: "habeas corpus",
        definition:
          "A legal principle that protects against unlawful detention by requiring authorities to justify imprisonment",
        category: "Constitutional Law",
        relatedArticles: ["Article 21", "Article 22"],
        examples: ["Writ of habeas corpus filed for illegal detention"],
      },
      {
        term: "due process",
        definition: "Fair treatment through the judicial system, ensuring legal rights are respected",
        category: "Constitutional Law",
        relatedArticles: ["Article 21"],
        examples: ["Due process violation in criminal proceedings"],
      },
      {
        term: "jurisdiction",
        definition: "The authority of a court to hear and decide cases within a specific territory or subject matter",
        category: "Civil Procedure",
        relatedArticles: ["Article 32", "Article 226"],
        examples: ["High Court has jurisdiction over state matters"],
      },
      {
        term: "plaintiff",
        definition: "The person who brings a legal action or lawsuit against another party",
        category: "Civil Procedure",
        relatedArticles: [],
        examples: ["The plaintiff filed a damages claim"],
      },
      {
        term: "defendant",
        definition: "The person being sued or accused in a legal proceeding",
        category: "Civil Procedure",
        relatedArticles: [],
        examples: ["The defendant pleaded not guilty"],
      },
      {
        term: "fundamental rights",
        definition: "Basic human rights guaranteed by the Constitution, enforceable by courts",
        category: "Constitutional Law",
        relatedArticles: ["Article 12-35"],
        examples: ["Right to equality is a fundamental right"],
      },
      {
        term: "directive principles",
        definition: "Guidelines for governance contained in Part IV of the Constitution",
        category: "Constitutional Law",
        relatedArticles: ["Article 36-51"],
        examples: ["State should follow directive principles in policy making"],
      },
      {
        term: "writ",
        definition: "A formal written order issued by a court commanding specific action",
        category: "Constitutional Law",
        relatedArticles: ["Article 32", "Article 226"],
        examples: ["Writ of mandamus, certiorari, prohibition"],
      },
      {
        term: "bail",
        definition: "Temporary release of an accused person awaiting trial, usually on payment of security",
        category: "Criminal Law",
        relatedArticles: ["Article 21", "Article 22"],
        examples: ["Anticipatory bail application filed"],
      },
      {
        term: "injunction",
        definition: "A court order requiring a party to do or refrain from doing specific acts",
        category: "Civil Procedure",
        relatedArticles: [],
        examples: ["Temporary injunction granted to stop construction"],
      },
    ]

    await LegalTerm.insertMany(commonLegalTerms)
    console.log("Legal terms database initialized")
  }

  // Process extracted text (OCR is done on client-side with Tesseract.js)
  static async processExtractedText(extractedText, confidence = 0.8) {
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("No text provided for processing")
    }

    return {
      text: extractedText.trim(),
      confidence: confidence,
      overlay: null,
    }
  }

  // Detect legal terms in extracted text
  static async detectLegalTerms(text) {
    await connectDB()

    const legalTerms = await LegalTerm.find()
    const detectedTerms = []

    for (const termDoc of legalTerms) {
      const regex = new RegExp(`\\b${termDoc.term}\\b`, "gi")
      const matches = [...text.matchAll(regex)]

      for (const match of matches) {
        detectedTerms.push({
          term: termDoc.term,
          definition: termDoc.definition,
          category: termDoc.category,
          relatedArticles: termDoc.relatedArticles,
          examples: termDoc.examples,
          position: {
            start: match.index,
            end: match.index + match[0].length,
            x: Math.random() * 70 + 10,
            y: Math.random() * 70 + 10,
            width: match[0].length * 2,
            height: 8,
          },
          confidence: 0.9,
        })
      }
    }

    return detectedTerms
  }

  // Save scanned document to database
  static async saveScannedDocument(userId, imageBase64, ocrResult, detectedTerms) {
    await connectDB()

    const document = new ScannedDocument({
      userId,
      originalText: ocrResult.text,
      detectedTerms: detectedTerms.map((term) => ({
        term: term.term,
        definition: term.definition,
        position: term.position,
        confidence: term.confidence,
      })),
      documentType: this.classifyDocument(ocrResult.text),
      summary: await this.generateSummary(ocrResult.text),
      imageUrl: await this.saveImage(imageBase64),
      processingStatus: "completed",
    })

    await document.save()
    return document
  }

  // Classify document type based on content
  static classifyDocument(text) {
    const lowerText = text.toLowerCase()

    if (lowerText.includes("contract") || lowerText.includes("agreement")) {
      return "contract"
    }
    if (lowerText.includes("court") || lowerText.includes("judgment") || lowerText.includes("order")) {
      return "court_document"
    }
    if (lowerText.includes("notice") || lowerText.includes("summons")) {
      return "legal_notice"
    }
    if (lowerText.includes("act") || lowerText.includes("section") || lowerText.includes("article")) {
      return "legislation"
    }

    return "other"
  }

  // Generate summary using simple extraction
  static async generateSummary(text) {
    const shortText = text.substring(0, 200).trim()
    return shortText + (shortText.length >= 200 ? "..." : "")
  }

  // Optional: Save image to cloud storage
  static async saveImage(imageBase64) {
    return "/placeholder-document.jpg"
  }

  // Generate quiz from scanned document
  static async generateQuizFromDocument(documentId, userId) {
    await connectDB()

    const document = await ScannedDocument.findById(documentId)
    if (!document) {
      throw new Error("Document not found")
    }

    const quizData = {
      topic: `Document Analysis - ${document.documentType}`,
      category: "Legal Documents",
      difficulty: "Intermediate",
      questionCount: Math.min(document.detectedTerms.length, 5),
      timeLimit: 10,
      sourceDocument: documentId,
    }

    const quiz = await QuizService.createQuiz(quizData)

    document.generatedQuizId = quiz._id
    await document.save()

    return quiz
  }

  // Get user's scan history
  static async getUserScanHistory(userId, limit = 10, skip = 0) {
    await connectDB()

    const documents = await ScannedDocument.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("generatedQuizId", "title difficulty")

    return documents
  }

  // Get document by ID
  static async getDocumentById(documentId) {
    await connectDB()

    const document = await ScannedDocument.findById(documentId).populate("generatedQuizId")
    return document
  }
}

export default DocumentScannerService
