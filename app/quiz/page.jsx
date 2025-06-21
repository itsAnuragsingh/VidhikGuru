"use client"

import SidebarLayout from "@/components/sidebar-layout"
import { Trophy, Play, Clock, Target, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function QuizPage() {
  const quizCategories = [
    {
      title: "Fundamental Rights",
      description: "Test your knowledge of Articles 12-35",
      questions: 25,
      difficulty: "Beginner",
      time: "15 min",
      color: "from-blue-500 to-blue-600",
      icon: <Target className="w-6 h-6" />,
    },
    {
      title: "Directive Principles",
      description: "Articles 36-51 and state policy guidelines",
      questions: 20,
      difficulty: "Intermediate",
      time: "12 min",
      color: "from-green-500 to-green-600",
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: "Constitutional Amendments",
      description: "Major amendments and their impact",
      questions: 30,
      difficulty: "Advanced",
      time: "20 min",
      color: "from-purple-500 to-purple-600",
      icon: <Trophy className="w-6 h-6" />,
    },
  ]

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Constitutional Quiz</h1>
              <p className="text-gray-600">Test your knowledge and track your progress</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-700">24</div>
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
                      <div className="text-2xl font-bold text-green-700">87%</div>
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
                      <div className="text-2xl font-bold text-purple-700">2.5h</div>
                      <div className="text-sm text-purple-600">Time Spent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quiz Categories */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Available Quizzes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizCategories.map((quiz, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 border-gray-200">
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${quiz.color} rounded-xl flex items-center justify-center mb-4`}
                      >
                        {quiz.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Questions:</span>
                          <span className="font-medium">{quiz.questions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Difficulty:</span>
                          <span className="font-medium">{quiz.difficulty}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Time:</span>
                          <span className="font-medium">{quiz.time}</span>
                        </div>
                      </div>

                      <Button className={`w-full bg-gradient-to-r ${quiz.color} hover:opacity-90 text-white`}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}