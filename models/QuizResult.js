import mongoose from "mongoose"

const QuizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: [
      {
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean,
        timeSpent: Number, // seconds spent on this question
      },
    ],
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true, // total time in seconds
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
QuizResultSchema.index({ userId: 1, quizId: 1 })
QuizResultSchema.index({ completedAt: -1 })
QuizResultSchema.index({ percentage: -1 })

const QuizResult = mongoose.models.QuizResult || mongoose.model("QuizResult", QuizResultSchema)
export default QuizResult
