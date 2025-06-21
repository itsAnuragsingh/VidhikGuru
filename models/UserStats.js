import mongoose from "mongoose"

const UserStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    totalQuizzes: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number,
      default: 0, // in seconds
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    streak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
    },
    categoryStats: [
      {
        category: String,
        attempted: Number,
        averageScore: Number,
        bestScore: Number,
      },
    ],
    lastQuizDate: Date,
    rank: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const UserStats = mongoose.models.UserStats || mongoose.model("UserStats", UserStatsSchema)
export default UserStats
