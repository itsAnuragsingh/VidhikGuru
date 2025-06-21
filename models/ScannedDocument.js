import mongoose from "mongoose"

const LegalTermSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true,
  },
  definition: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  relatedArticles: [String],
  examples: [String],
})

const ScannedDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    detectedTerms: [
      {
        term: String,
        definition: String,
        position: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
        confidence: Number,
      },
    ],
    documentType: {
      type: String,
      enum: ["contract", "legal_notice", "court_document", "legislation", "other"],
      default: "other",
    },
    summary: String,
    generatedQuizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
    imageUrl: String,
    processingStatus: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
ScannedDocumentSchema.index({ userId: 1, createdAt: -1 })
ScannedDocumentSchema.index({ processingStatus: 1 })

const LegalTerm = mongoose.models.LegalTerm || mongoose.model("LegalTerm", LegalTermSchema)
const ScannedDocument = mongoose.models.ScannedDocument || mongoose.model("ScannedDocument", ScannedDocumentSchema)

export { LegalTerm, ScannedDocument }
