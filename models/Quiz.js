import mongoose from "mongoose"

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  correctAnswer: {
    type: Number,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
})

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    timeLimit: {
      type: Number,
      required: true, // in minutes
    },
    questions: [QuestionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: "system",
    },
    tags: [String],
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema)
export default Quiz