"use client"

import { useState, useEffect } from "react"
import SidebarLayout from "@/components/sidebar-layout"
import { BookOpen, Clock, CheckCircle, ArrowRight, Target, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useUser } from "@civic/auth/react";

export default function LearnPage() {
  const [constitutionParts, setConstitutionParts] = useState([])
  const [userProgress, setUserProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
const { user } = useUser();

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch constitution parts with detailed error handling
      console.log("Fetching constitution parts...")
      const partsResponse = await fetch("/api/constitution")
      
      if (!partsResponse.ok) {
        throw new Error(`HTTP error! status: ${partsResponse.status}`)
      }
      
      const partsData = await partsResponse.json()
      console.log("Constitution API Response:", partsData)

      // Set debug info to help troubleshoot
      setDebugInfo({
        partsResponse: partsData,
        partsDataType: typeof partsData,
        partsDataKeys: Object.keys(partsData || {}),
        dataArray: Array.isArray(partsData?.data),
        dataLength: partsData?.data?.length || 0
      })

      // Fetch user progress
      const progressResponse = await fetch("/api/user-progress?userId=" + (user?.id || "user123"))
      let progressData = null
      
      if (progressResponse.ok) {
        progressData = await progressResponse.json()
        console.log("Progress API Response:", progressData)
      } else {
        console.warn("Could not fetch user progress:", progressResponse.status)
      }

      // Handle different possible response structures
      if (partsData.success && Array.isArray(partsData.data)) {
        setConstitutionParts(partsData.data)
      } else if (Array.isArray(partsData)) {
        // Direct array response
        setConstitutionParts(partsData)
      } else if (partsData.data && Array.isArray(partsData.data)) {
        // Data property contains array
        setConstitutionParts(partsData.data)
      } else {
        console.error("Unexpected API response structure:", partsData)
        setError("Invalid response format from constitution API")
      }

      if (progressData?.success) {
        setUserProgress(progressData.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getPartProgress = (part) => {
    if (!userProgress) return 0

    const readArticlesInPart = userProgress.readArticles.filter((article) => article.partNo === part.PartNo).length

    return part.Articles.length > 0 ? Math.round((readArticlesInPart / part.Articles.length) * 100) : 0
  }

  const isPartCompleted = (part) => {
    return getPartProgress(part) === 100
  }

  // Helper function to convert Roman numerals to numbers for sorting
  const romanToNumber = (roman) => {
    const romanNumerals = {
      I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
      XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15, XVI: 16, XVII: 17, XVIII: 18, XIX: 19, XX: 20,
      XXI: 21, XXII: 22,
    }
    return romanNumerals[roman] || 999
  }

  // Sort parts by Roman numeral order
  const sortedParts = [...constitutionParts].sort((a, b) => romanToNumber(a.PartNo) - romanToNumber(b.PartNo))

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading constitution parts...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchData} className="bg-orange-500 hover:bg-orange-600">
              Try Again
            </Button>
            
            {/* Debug Information */}
            {debugInfo && process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                <h3 className="font-bold mb-2">Debug Info:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Learn Constitution</h1>
                <p className="text-gray-600">Master constitutional concepts part by part</p>
              </div>
            </div>

            {userProgress && (
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{userProgress.progressPercentage}%</div>
                <div className="text-sm text-gray-500">Overall Progress</div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Progress Overview */}
            {userProgress && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-700">{userProgress.totalArticlesRead}</div>
                        <div className="text-sm text-blue-600">Articles Read</div>
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
                        <div className="text-2xl font-bold text-green-700">{userProgress.progressPercentage}%</div>
                        <div className="text-sm text-green-600">Completion</div>
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
                          {Math.round(userProgress.totalTimeSpent / 60)}m
                        </div>
                        <div className="text-sm text-purple-600">Time Spent</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Constitution Parts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Constitution Parts</h2>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">{constitutionParts.length} parts available</div>
                  {constitutionParts.length === 0 && (
                    <Button 
                      onClick={fetchData} 
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      Refresh
                    </Button>
                  )}
                </div>
              </div>

              {constitutionParts.length === 0 ? (
                <Card className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Constitution Parts Found</h3>
                  <p className="text-gray-600 mb-4">
                    Unable to load constitution parts. This might be due to:
                  </p>
                  <ul className="text-sm text-gray-500 text-left max-w-md mx-auto mb-4">
                    <li>• API endpoint not returning data</li>
                    <li>• Database connection issues</li>
                    <li>• Incorrect API response format</li>
                    <li>• Missing data in the database</li>
                  </ul>
                  <Button onClick={fetchData} className="bg-orange-500 hover:bg-orange-600">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Retry Loading
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sortedParts.map((part) => {
                    const progress = getPartProgress(part)
                    const completed = isPartCompleted(part)

                    return (
                      <Card key={part.PartNo} className="hover:shadow-lg transition-all duration-300 border-gray-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  completed ? "bg-green-500" : progress > 0 ? "bg-orange-500" : "bg-gray-400"
                                }`}
                              >
                                {completed ? (
                                  <CheckCircle className="w-6 h-6 text-white" />
                                ) : (
                                  <BookOpen className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-500">Part {part.PartNo}</div>
                                <h3 className="text-lg font-bold text-gray-900">{part.Name}</h3>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{progress}%</div>
                              <div className="text-xs text-gray-500">Complete</div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Articles:</span>
                              <span className="font-medium">{part.Articles?.length || 0}</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  completed ? "bg-green-500" : progress > 0 ? "bg-orange-500" : "bg-gray-300"
                                }`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>

                            <Link href={`/learn/part/${part.PartNo}`}>
                              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                                {completed ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Review Part
                                  </>
                                ) : progress > 0 ? (
                                  <>
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Continue Reading
                                  </>
                                ) : (
                                  <>
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Start Reading
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
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}