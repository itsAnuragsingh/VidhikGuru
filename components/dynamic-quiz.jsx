"use client"

import { useState, useEffect } from "react"
import { Trophy, Play, Clock, Target, Award, CheckCircle, XCircle, RotateCcw, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { fallbackQuizzes } from "@/lib/quiz-data"

export default function DynamicQuiz({ userId = "user_123" }) {
  const [quizState, setQuizState] = useState("selection")
  const [quizzes, setQuizzes] = useState([])
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    bestScore: 0,
    categoryStats: [],
  })
  const [quizResult, setQuizResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [createQuizOpen, setCreateQuizOpen] = useState(false)
  const [useGemini, setUseGemini] = useState(true)

  // Load quizzes and user stats on mount
  useEffect(() => {
    loadQuizzes()
    loadUserStats()
  }, [])

  // Timer effect
  useEffect(() => {
    let interval
    if (quizState === "taking" && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleQuizComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [quizState, timeRemaining])

  const loadQuizzes = async () => {
    try {
      const response = await fetch("/api/quiz")
      const data = await response.json()

      if (data.success && data.data.length > 0) {
        setQuizzes(data.data)
      } else {
        // Fallback to static data if no quizzes in database
        console.log("No quizzes found in database, using fallback data")
        setQuizzes(fallbackQuizzes)
        toast.info("Using sample quizzes. Create new ones with AI!")
      }
    } catch (error) {
      console.error("Error loading quizzes:", error)
      // Use fallback data on error
      setQuizzes(fallbackQuizzes)
      toast.error("Failed to load quizzes from server, using sample data")
    }
  }

  const loadUserStats = async () => {
    try {
      const response = await fetch(`/api/user/stats?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setUserStats(data.data)
      }
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  const createQuiz = async (formData) => {
    setLoading(true)
    try {
      if (useGemini) {
        // Try Gemini API first
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const data = await response.json()
        if (data.success) {
          toast.success("AI Quiz created successfully!")
          setCreateQuizOpen(false)
          loadQuizzes()
        } else {
          throw new Error(data.error || "Failed to create quiz with AI")
        }
      } else {
        // Create quiz with static template
        const staticQuiz = createStaticQuiz(formData)
        setQuizzes((prev) => [...prev, staticQuiz])
        toast.success("Static quiz created successfully!")
        setCreateQuizOpen(false)
      }
    } catch (error) {
      console.error("Error creating quiz:", error)
      toast.error("AI creation failed. Try static mode or check your API key.")
      setUseGemini(false)
    } finally {
      setLoading(false)
    }
  }

  const createStaticQuiz = (formData) => {
    // Create a basic quiz structure when Gemini fails
    const baseQuestions = [
      {
        question: `What is the main topic of ${formData.topic}?`,
        options: [
          `Basic concept of ${formData.topic}`,
          `Advanced theory of ${formData.topic}`,
          `Historical background of ${formData.topic}`,
          `Future implications of ${formData.topic}`,
        ],
        correctAnswer: 0,
        explanation: `This question tests basic understanding of ${formData.topic}.`,
      },
      {
        question: `Which category does ${formData.topic} belong to?`,
        options: [formData.category, "General Knowledge", "Science", "History"],
        correctAnswer: 0,
        explanation: `${formData.topic} belongs to ${formData.category} category.`,
      },
    ]

    return {
      _id: `static_${Date.now()}`,
      title: `${formData.topic} Quiz`,
      description: `Test your knowledge about ${formData.topic}`,
      category: formData.category,
      difficulty: formData.difficulty,
      timeLimit: formData.timeLimit,
      questions: baseQuestions.slice(0, formData.questionCount),
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
      isStatic: true,
    }
  }

  const startQuiz = async (quiz) => {
    setQuizState("loading")
    try {
      if (quiz.isStatic) {
        // For static quizzes, use directly
        setCurrentQuiz(quiz)
        setCurrentQuestionIndex(0)
        setSelectedAnswers(new Array(quiz.questions.length).fill(-1))
        setTimeRemaining(quiz.timeLimit * 60)
        setQuizState("taking")
      } else {
        // For database quizzes, fetch full data
        const response = await fetch(`/api/quiz/${quiz._id}`)
        const data = await response.json()

        if (data.success) {
          setCurrentQuiz(data.data)
          setCurrentQuestionIndex(0)
          setSelectedAnswers(new Array(data.data.questions.length).fill(-1))
          setTimeRemaining(data.data.timeLimit * 60)
          setQuizState("taking")
        } else {
          toast.error("Failed to load quiz")
          setQuizState("selection")
        }
      }
    } catch (error) {
      console.error("Error starting quiz:", error)
      toast.error("Failed to start quiz")
      setQuizState("selection")
    }
  }

  const selectAnswer = (answerIndex) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleQuizComplete()
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleQuizComplete = async () => {
    if (!currentQuiz) return

    setQuizState("loading")
    try {
      const timeSpentInSeconds = currentQuiz.timeLimit * 60 - timeRemaining

      // Calculate results locally for static quizzes
      if (currentQuiz.isStatic) {
        const results = calculateQuizResults(currentQuiz, selectedAnswers, timeSpentInSeconds)
        setQuizResult(results)
        setQuizState("completed")
        return
      }

      // For database quizzes, submit to server
      const answers = selectedAnswers.map((answer, index) => ({
        questionIndex: index,
        selectedAnswer: answer,
        timeSpent: Math.floor(timeSpentInSeconds / selectedAnswers.length),
      }))

      const response = await fetch(`/api/quiz/${currentQuiz._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          answers,
          totalTimeSpent: timeSpentInSeconds,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setQuizResult(data.data)
        setQuizState("completed")
        loadUserStats()
      } else {
        toast.error("Failed to submit quiz")
        setQuizState("selection")
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Failed to submit quiz")
      setQuizState("selection")
    }
  }

  const calculateQuizResults = (quiz, answers, timeSpent) => {
    let correctCount = 0
    const detailedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index]
      const isCorrect = answer === question.correctAnswer
      if (isCorrect) correctCount++

      return {
        questionIndex: index,
        selectedAnswer: answer,
        isCorrect,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      }
    })

    const percentage = Math.round((correctCount / quiz.questions.length) * 100)

    return {
      result: {
        score: correctCount,
        totalQuestions: quiz.questions.length,
        percentage,
        timeSpent,
      },
      detailedAnswers,
    }
  }

  const resetQuiz = () => {
    setQuizState("selection")
    setCurrentQuiz(null)
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setTimeRemaining(0)
    setQuizResult(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getIconComponent = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return <Target className="w-6 h-6" />
      case "Intermediate":
        return <Award className="w-6 h-6" />
      case "Advanced":
        return <Trophy className="w-6 h-6" />
      default:
        return <Target className="w-6 h-6" />
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "from-blue-500 to-blue-600"
      case "Intermediate":
        return "from-green-500 to-green-600"
      case "Advanced":
        return "from-purple-500 to-purple-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  if (quizState === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (quizState === "taking" && currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100

    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{currentQuiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className={`font-mono ${timeRemaining < 60 ? "text-red-600" : "text-gray-700"}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button variant="outline" onClick={resetQuiz}>
                Exit Quiz
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswers[currentQuestionIndex] === index
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAnswers[currentQuestionIndex] === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === -1}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentQuestionIndex === currentQuiz.questions.length - 1 ? "Finish Quiz" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (quizState === "completed" && quizResult) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{quizResult.result.percentage}%</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{quizResult.result.score}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {quizResult.result.totalQuestions - quizResult.result.score}
                    </div>
                    <div className="text-sm text-gray-600">Incorrect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round(quizResult.result.timeSpent / 60)}m
                    </div>
                    <div className="text-sm text-gray-600">Time</div>
                  </div>
                </div>

                <div className="text-left space-y-4">
                  <h3 className="text-lg font-semibold">Review Answers</h3>
                  {quizResult.detailedAnswers.map((answer, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">{answer.question}</p>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Your answer:</strong> {answer.options[answer.selectedAnswer] || "Not answered"}
                          </p>
                          <p className="text-sm text-green-600 mb-2">
                            <strong>Correct answer:</strong> {answer.options[answer.correctAnswer]}
                          </p>
                          <p className="text-sm text-gray-700">{answer.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4 justify-center">
                  <Button onClick={resetQuiz} className="bg-blue-600 hover:bg-blue-700">
                    Take Another Quiz
                  </Button>
                  <Button variant="outline" onClick={() => currentQuiz && startQuiz(currentQuiz)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Constitutional Quiz</h1>
              <p className="text-gray-600">
                {useGemini ? "AI-powered quizzes with dynamic content" : "Sample quizzes available"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={useGemini ? "default" : "secondary"}>{useGemini ? "AI Mode" : "Static Mode"}</Badge>
            <CreateQuizDialog
              open={createQuizOpen}
              onOpenChange={setCreateQuizOpen}
              onCreateQuiz={createQuiz}
              loading={loading}
              useGemini={useGemini}
              setUseGemini={setUseGemini}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-700">{userStats.totalQuizzes}</div>
                    <div className="text-sm text-blue-600">Quizzes Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700">{Math.round(userStats.averageScore)}%</div>
                    <div className="text-sm text-green-600">Average Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-700">
                      {Math.round(userStats.totalTimeSpent / 60)}m
                    </div>
                    <div className="text-sm text-purple-600">Time Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Available Quizzes</h2>
              <Button onClick={() => setCreateQuizOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => {
                const categoryStats = userStats.categoryStats.find((cat) => cat.category === quiz.category)

                return (
                  <Card key={quiz._id} className="hover:shadow-lg transition-all duration-300 border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)} rounded-xl flex items-center justify-center`}
                        >
                          {getIconComponent(quiz.difficulty)}
                        </div>
                        {quiz.isStatic && (
                          <Badge variant="outline" className="text-xs">
                            Sample
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Questions:</span>
                          <span className="font-medium">{quiz.questions.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Difficulty:</span>
                          <Badge
                            variant={
                              quiz.difficulty === "Beginner"
                                ? "secondary"
                                : quiz.difficulty === "Intermediate"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {quiz.difficulty}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Time:</span>
                          <span className="font-medium">{quiz.timeLimit} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Category:</span>
                          <span className="font-medium">{quiz.category}</span>
                        </div>
                        {categoryStats && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Your Attempts:</span>
                              <span className="font-medium">{categoryStats.attempted}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Your Best:</span>
                              <span className="font-medium text-green-600">{Math.round(categoryStats.bestScore)}%</span>
                            </div>
                          </>
                        )}
                      </div>

                      <Button
                        className={`w-full bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)} hover:opacity-90 text-white`}
                        onClick={() => startQuiz(quiz)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateQuizDialog({ open, onOpenChange, onCreateQuiz, loading, useGemini, setUseGemini }) {
  const [formData, setFormData] = useState({
    topic: "",
    category: "",
    difficulty: "",
    questionCount: 5,
    timeLimit: 10,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreateQuiz(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useGemini"
              checked={useGemini}
              onChange={(e) => setUseGemini(e.target.checked)}
            />
            <Label htmlFor="useGemini">Use AI Generation (Gemini)</Label>
          </div>

          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Fundamental Rights"
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Constitutional Law"
              required
            />
          </div>
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="questionCount">Number of Questions</Label>
            <Input
              id="questionCount"
              type="number"
              min="2"
              max="20"
              value={formData.questionCount}
              onChange={(e) => setFormData({ ...formData, questionCount: Number.parseInt(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              min="5"
              max="60"
              value={formData.timeLimit}
              onChange={(e) => setFormData({ ...formData, timeLimit: Number.parseInt(e.target.value) })}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {useGemini ? "Creating AI Quiz..." : "Creating Quiz..."}
              </>
            ) : (
              `Create ${useGemini ? "AI" : "Static"} Quiz`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
