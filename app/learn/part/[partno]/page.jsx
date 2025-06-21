"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import SidebarLayout from "@/components/sidebar-layout"
import { BookOpen, Clock, CheckCircle, ArrowRight, ArrowLeft, Target, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useUser } from "@civic/auth/react";
export default function PartPage() {
  const params = useParams()
  const partNo = params.partno
const { user } = useUser();
  const [part, setPart] = useState(null)
  const [userProgress, setUserProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPartData()
  }, [partNo])

  const fetchPartData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch specific part data using the correct API endpoint
      const partResponse = await fetch(`/api/constitution/${partNo}`)
      if (!partResponse.ok) {
        throw new Error(`Failed to fetch part data: ${partResponse.status}`)
      }

      const partData = await partResponse.json()

      // Fetch user progress
      const progressResponse = await fetch("/api/user-progress?userId=" + (user?.id || "user123"))
      let progressData = null

      if (progressResponse.ok) {
        progressData = await progressResponse.json()
      }

      if (partData.success && partData.data) {
        setPart(partData.data)
      } else {
        throw new Error("Invalid part data received")
      }

      if (progressData?.success) {
        setUserProgress(progressData.data)
      }
    } catch (error) {
      console.error("Error fetching part data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getArticleProgress = (articleNo) => {
    if (!userProgress) return false
    return userProgress.readArticles.some((article) => article.partNo === partNo && article.articleNo === articleNo)
  }

  const getPartProgress = () => {
    if (!part || !part.Articles || !userProgress) return 0
    const readArticlesInPart = userProgress.readArticles.filter(
      (article) => article.partNo === partNo
    ).length
    return part.Articles.length > 0
      ? Math.round((readArticlesInPart / part.Articles.length) * 100)
      : 0
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading part {partNo}...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !part || !part.Articles) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Part</h2>
            <p className="text-gray-600 mb-4">{error || "Part not found or invalid data structure"}</p>
            <div className="space-x-2">
              <Button onClick={fetchPartData} className="bg-orange-500 hover:bg-orange-600">
                Try Again
              </Button>
              <Link href="/learn">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Learn
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const progress = getPartProgress()
  const completedArticles = userProgress
    ? userProgress.readArticles.filter((article) => article.partNo === partNo).length
    : 0

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/learn">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Learn
              </Button>
            </Link>

            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Part {partNo}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{part.Name}</h1>
                <p className="text-gray-600 mt-1">
                  {part.Articles?.length || 0} articles • {completedArticles} completed
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600">{progress}%</div>
              <div className="text-sm text-gray-500">Progress</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {completedArticles} of {part.Articles?.length || 0} articles
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Part Description */}
            {part.Description && (
              <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">About This Part</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800 leading-relaxed">{part.Description}</p>
                </CardContent>
              </Card>
            )}

            {/* Articles List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles</h2>

              {part.Articles && part.Articles.length > 0 ? (
                <div className="grid gap-4">
                  {part.Articles.map((article, index) => {
                    const isRead = getArticleProgress(article.ArtNo)
                    const isNext = !isRead && index === completedArticles

                    return (
                      <Card
                        key={article.ArtNo}
                        className={`hover:shadow-lg transition-all duration-300 ${
                          isNext ? "ring-2 ring-orange-500 ring-opacity-50" : ""
                        } ${isRead ? "bg-green-50 border-green-200" : "border-gray-200"}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  isRead ? "bg-green-500" : isNext ? "bg-orange-500" : "bg-gray-400"
                                }`}
                              >
                                {isRead ? (
                                  <CheckCircle className="w-6 h-6 text-white" />
                                ) : (
                                  <span className="text-white font-bold">{article.ArtNo}</span>
                                )}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="text-lg font-semibold text-gray-900">Article {article.ArtNo}</h3>
                                  {isNext && <Badge className="bg-orange-500 text-white">Next</Badge>}
                                  {isRead && <Badge className="bg-green-500 text-white">Completed</Badge>}
                                </div>

                                <p className="text-gray-600 line-clamp-2">
                                  {article.Name || article.Content?.substring(0, 100) + "..."}
                                </p>

                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>~5 min read</span>
                                  </div>
                                  {isRead && (
                                    <div className="flex items-center space-x-1 text-green-600">
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Read</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Link href={`/learn/part/${partNo}/article/${article.ArtNo}`}>
                              <Button
                                className={`${
                                  isRead
                                    ? "bg-green-500 hover:bg-green-600"
                                    : isNext
                                      ? "bg-orange-500 hover:bg-orange-600"
                                      : "bg-gray-500 hover:bg-gray-600"
                                } text-white`}
                              >
                                {isRead ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Review
                                  </>
                                ) : (
                                  <>
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Read
                                  </>
                                )}
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Articles Found</h3>
                  <p className="text-gray-600">This part doesn't contain any articles yet.</p>
                </Card>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <Link href="/learn">
                <Button variant="outline" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to All Parts</span>
                </Button>
              </Link>

              {progress === 100 && (
                <div className="text-center">
                  <div className="flex items-center space-x-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Part Completed!</span>
                  </div>
                  <Link href="/learn">
                    <Button className="bg-green-500 hover:bg-green-600 text-white">
                      <Target className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}