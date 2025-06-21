"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import SidebarLayout from "@/components/sidebar-layout"
import { Clock, CheckCircle, ArrowRight, ArrowLeft, Target, AlertCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useUser } from "@civic/auth/react";
export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const partNo = params.partno
  const articleNo = params.articleno
  const { user } = useUser();
  const [article, setArticle] = useState(null)
  const [part, setPart] = useState(null)
  const [userProgress, setUserProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMarking, setIsMarking] = useState(false)
  const [readingTime, setReadingTime] = useState(0)

  useEffect(() => {
    fetchArticleData()

    // Start reading timer
    const startTime = Date.now()
    const timer = setInterval(() => {
      setReadingTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [partNo, articleNo])

  // ...existing code...
const fetchArticleData = async () => {
  try {
    setLoading(true)
    setError(null)

    // Fetch part and article info
    const partResponse = await fetch(`/api/constitution?partNo=${partNo}`)
    const partData = await partResponse.json()
    const articleRes = await fetch(`/api/constitution/${partNo}/${articleNo}`)
     const articleData = await articleRes.json()
    
    let partInfo = null
    if (partData.success && partData.data) {
      if (Array.isArray(partData.data)) {
        partInfo = partData.data.find((p) => p.PartNo === partNo)
      } else {
        partInfo = partData.data
      }
      if (!partInfo) throw new Error("Part not found")
      if (!partInfo.Articles) throw new Error("No articles found for this part")
      
      setPart(partInfo)
      setArticle(articleData.data.article)
    } else {
      throw new Error("Invalid part data received")
    }

    // Fetch user progress
    const progressResponse = await fetch("/api/user-progress?userId=" + (user?.id || "user123"))
    const progressData = await progressResponse.json()
    if (progressData?.success) {
      setUserProgress(progressData.data)
    }
  } catch (error) {
    console.error("Error fetching article data:", error)
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
// const fetchArticleData = async () => {
//   try {
//     setLoading(true)
//     setError(null)

//     // ✅ Fetch article data from new API
//     const articleRes = await fetch(`/api/constitution/${partNo}/${articleNo}`)
//     const articleData = await articleRes.json()

//     if (!articleData.success || !articleData.data) {
//       throw new Error("Article not found")
//     }

//     // ✅ Set article info (make sure your API returns both part and article info or separately fetch part)
//     setArticle(articleData.data.article)
//     setPart(articleData.data.part)

//     // ✅ Fetch user progress
//     const progressResponse = await fetch(`/api/user-progress?userId=default-user`)
//     const progressData = await progressResponse.json()
//     if (progressData?.success) {
//       setUserProgress(progressData.data)
//     }
//   } catch (error) {
//     console.error("Error fetching article data:", error)
//     setError(error.message)
//   } finally {
//     setLoading(false)
//   }
// }

// ...existing code...

  const markAsRead = async () => {
    try {
      setIsMarking(true)

      const response = await fetch("/api/user-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id || "user123",
          partNo,
          articleNo,
          timeSpent: readingTime,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Refresh user progress
          await fetchArticleData()

          // Navigate to next article or back to part
          const currentIndex = part.Articles.findIndex((a) => a.ArtNo === articleNo)
          const nextArticle = part.Articles[currentIndex + 1]

          if (nextArticle) {
            router.push(`/learn/part/${partNo}/article/${nextArticle.ArtNo}`)
          } else {
            router.push(`/learn/part/${partNo}`)
          }
        }
      }
    } catch (error) {
      console.error("Error marking article as read:", error)
    } finally {
      setIsMarking(false)
    }
  }

  const isArticleRead = () => {
    if (!userProgress) return false
    return userProgress.readArticles.some((a) => a.partNo === partNo && a.articleNo === articleNo)
  }

  const getNavigationInfo = () => {
    if (!part) return { prev: null, next: null, current: 0, total: 0 }

    const currentIndex = part.Articles.findIndex((a) => a.ArtNo === articleNo)
    const prevArticle = currentIndex > 0 ? part.Articles[currentIndex - 1] : null
    const nextArticle = currentIndex < part.Articles.length - 1 ? part.Articles[currentIndex + 1] : null

    return {
      prev: prevArticle,
      next: nextArticle,
      current: currentIndex + 1,
      total: part.Articles.length,
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article {articleNo}...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !article || !part) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Article Not Found</h2>
            <p className="text-gray-600 mb-4">{error || "The requested article could not be found"}</p>
            <div className="space-x-2">
              <Button onClick={fetchArticleData} className="bg-orange-500 hover:bg-orange-600">
                Try Again
              </Button>
              <Link href={`/learn/part/${partNo}`}>
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Part
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  const navigation = getNavigationInfo()
  const isRead = isArticleRead()
  const estimatedReadTime = Math.ceil((article.Content?.length || 1000) / 200) // ~200 words per minute

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/learn/part/${partNo}`}>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Part {partNo}
              </Button>
            </Link>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {navigation.current} of {navigation.total}
              </Badge>
              {isRead && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">
                Part {partNo}: {part.Name}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Article {articleNo}
                {article.Name && `: ${article.Name}`}
              </h1>
            </div>

            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>~{estimatedReadTime} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>
                    {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress within part */}
          <div className="mt-4">
            <Progress value={(navigation.current / navigation.total) * 100} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {article.ArtDesc || "Content not available for this article."}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Article Actions */}
            <Card className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {isRead ? "Article Completed!" : "Mark as Read"}
                    </h3>
                    <p className="text-gray-600">
                      {isRead
                        ? "You've already read this article. Great job!"
                        : "Click below to mark this article as read and continue your learning journey."}
                    </p>
                  </div>

                  {!isRead && (
                    <Button
                      onClick={markAsRead}
                      disabled={isMarking}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isMarking ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Marking...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Read
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <div>
                {navigation.prev ? (
                  <Link href={`/learn/part/${partNo}/article/${navigation.prev.ArtNo}`}>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <ArrowLeft className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-xs text-gray-500">Previous</div>
                        <div>Article {navigation.prev.ArtNo}</div>
                      </div>
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/learn/part/${partNo}`}>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Part</span>
                    </Button>
                  </Link>
                )}
              </div>

              <div>
                {navigation.next ? (
                  <Link href={`/learn/part/${partNo}/article/${navigation.next.ArtNo}`}>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-xs opacity-90">Next</div>
                        <div>Article {navigation.next.ArtNo}</div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/learn/part/${partNo}`}>
                    <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Part Complete!</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
