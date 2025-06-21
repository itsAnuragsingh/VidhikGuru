import connectDB from "@/lib/mongodb"
import Quiz from "@/lib/models/Quiz"
import QuizResult from "@/lib/models/QuizResult"
import UserStats from "@/lib/models/UserStats"
import { generateQuizQuestions, generateQuizMetadata } from "./gemini"

export class QuizService {
  static async createQuiz(params) {
    await connectDB()

    try {
      const metadata = await generateQuizMetadata(params.topic, params.category)

      const generationParams = {
        topic: params.topic,
        difficulty: params.difficulty,
        questionCount: params.questionCount,
        category: params.category,
      }

      const questions = await generateQuizQuestions(generationParams)

      const quiz = new Quiz({
        title: metadata.title,
        description: metadata.description,
        category: params.category,
        difficulty: params.difficulty,
        timeLimit: params.timeLimit,
        questions: questions,
        tags: params.tags || [params.topic, params.category],
      })

      await quiz.save()
      return quiz
    } catch (error) {
      console.error("Error creating quiz:", error)
      throw new Error("Failed to create quiz")
    }
  }

  static async getQuizzes(filters) {
    await connectDB()

    const query = {}
    if (filters?.category) query.category = filters.category
    if (filters?.difficulty) query.difficulty = filters.difficulty
    if (filters?.isActive !== undefined) query.isActive = filters.isActive

    const quizzes = await Quiz.find(query)
      .select("-questions.explanation")
      .limit(filters?.limit || 50)
      .skip(filters?.skip || 0)
      .sort({ createdAt: -1 })

    return quizzes
  }

  static async getQuizById(quizId) {
    await connectDB()

    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
      throw new Error("Quiz not found")
    }

    return quiz
  }

  static async getQuizForTaking(quizId) {
    await connectDB()

    const quiz = await Quiz.findById(quizId).select("-questions.correctAnswer -questions.explanation")
    if (!quiz || !quiz.isActive) {
      throw new Error("Quiz not found or inactive")
    }

    return quiz
  }

  static async submitQuizResult(params) {
    await connectDB()

    try {
      const quiz = await Quiz.findById(params.quizId)
      if (!quiz) {
        throw new Error("Quiz not found")
      }

      let correctAnswers = 0
      const detailedAnswers = params.answers.map((answer, index) => {
        const question = quiz.questions[answer.questionIndex]
        const isCorrect = answer.selectedAnswer === question.correctAnswer
        if (isCorrect) correctAnswers++

        return {
          questionIndex: answer.questionIndex,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          timeSpent: answer.timeSpent,
        }
      })

      const percentage = Math.round((correctAnswers / quiz.questions.length) * 100)

      const quizResult = new QuizResult({
        userId: params.userId,
        quizId: params.quizId,
        answers: detailedAnswers,
        score: correctAnswers,
        totalQuestions: quiz.questions.length,
        percentage,
        timeSpent: params.totalTimeSpent,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      })

      await quizResult.save()

      await Quiz.findByIdAndUpdate(params.quizId, {
        $inc: { totalAttempts: 1 },
        $set: {
          averageScore: await this.calculateQuizAverageScore(params.quizId),
        },
      })

      await this.updateUserStats(params.userId, {
        quizId: params.quizId,
        category: quiz.category,
        score: correctAnswers,
        totalQuestions: quiz.questions.length,
        percentage,
        timeSpent: params.totalTimeSpent,
      })

      return {
        result: quizResult,
        quiz: quiz,
        detailedAnswers: detailedAnswers.map((answer, index) => ({
          ...answer,
          question: quiz.questions[answer.questionIndex].question,
          options: quiz.questions[answer.questionIndex].options,
          correctAnswer: quiz.questions[answer.questionIndex].correctAnswer,
          explanation: quiz.questions[answer.questionIndex].explanation,
        })),
      }
    } catch (error) {
      console.error("Error submitting quiz result:", error)
      throw new Error("Failed to submit quiz result")
    }
  }

  static async getUserStats(userId) {
    await connectDB()

    let userStats = await UserStats.findOne({ userId })

    if (!userStats) {
      userStats = new UserStats({ userId })
      await userStats.save()
    }

    return userStats
  }

  static async getUserQuizHistory(userId, limit = 10, skip = 0) {
    await connectDB()

    const results = await QuizResult.find({ userId })
      .populate("quizId", "title category difficulty")
      .sort({ completedAt: -1 })
      .limit(limit)
      .skip(skip)

    return results
  }

  static async getLeaderboard(category, limit = 10) {
    await connectDB()

    const matchStage = {}
    if (category) {
      const quizzes = await Quiz.find({ category }).select("_id")
      const quizIds = quizzes.map((q) => q._id)
      matchStage.quizId = { $in: quizIds }
    }

    const leaderboard = await QuizResult.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$userId",
          totalQuizzes: { $sum: 1 },
          averageScore: { $avg: "$percentage" },
          bestScore: { $max: "$percentage" },
          totalTimeSpent: { $sum: "$timeSpent" },
        },
      },
      { $sort: { averageScore: -1, bestScore: -1 } },
      { $limit: limit },
    ])

    return leaderboard
  }

  static async calculateQuizAverageScore(quizId) {
    const results = await QuizResult.aggregate([
      { $match: { quizId: quizId } },
      { $group: { _id: null, averageScore: { $avg: "$percentage" } } },
    ])

    return results.length > 0 ? Math.round(results[0].averageScore) : 0
  }

  static async updateUserStats(
    userId,
    quizData,
  ) {
    const userStats = await UserStats.findOne({ userId })

    if (!userStats) {
      const newStats = new UserStats({
        userId,
        totalQuizzes: 1,
        totalQuestions: quizData.totalQuestions,
        correctAnswers: quizData.score,
        totalTimeSpent: quizData.timeSpent,
        averageScore: quizData.percentage,
        bestScore: quizData.percentage,
        categoryStats: [
          {
            category: quizData.category,
            attempted: 1,
            averageScore: quizData.percentage,
            bestScore: quizData.percentage,
          },
        ],
        lastQuizDate: new Date(),
      })
      await newStats.save()
    } else {
      const newTotalQuizzes = userStats.totalQuizzes + 1
      const newTotalQuestions = userStats.totalQuestions + quizData.totalQuestions
      const newCorrectAnswers = userStats.correctAnswers + quizData.score
      const newAverageScore = Math.round((newCorrectAnswers / newTotalQuestions) * 100)

      const categoryIndex = userStats.categoryStats.findIndex((cat) => cat.category === quizData.category)
      if (categoryIndex >= 0) {
        const catStats = userStats.categoryStats[categoryIndex]
        catStats.attempted += 1
        catStats.averageScore = Math.round(
          (catStats.averageScore * (catStats.attempted - 1) + quizData.percentage) / catStats.attempted,
        )
        catStats.bestScore = Math.max(catStats.bestScore, quizData.percentage)
      } else {
        userStats.categoryStats.push({
          category: quizData.category,
          attempted: 1,
          averageScore: quizData.percentage,
          bestScore: quizData.percentage,
        })
      }

      await UserStats.findByIdAndUpdate(userStats._id, {
        totalQuizzes: newTotalQuizzes,
        totalQuestions: newTotalQuestions,
        correctAnswers: newCorrectAnswers,
        totalTimeSpent: userStats.totalTimeSpent + quizData.timeSpent,
        averageScore: newAverageScore,
        bestScore: Math.max(userStats.bestScore, quizData.percentage),
        categoryStats: userStats.categoryStats,
        lastQuizDate: new Date(),
      })
    }
  }
}
