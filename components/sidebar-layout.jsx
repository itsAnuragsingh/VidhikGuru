"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, Trophy, BookOpen, Menu, X, Sparkles, Users, Settings, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "Chat",
    href: "/chat",
    icon: MessageCircle,
    description: "AI Constitutional Assistant",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    activeColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    name: "Quiz",
    href: "/quiz",
    icon: Trophy,
    description: "Test Your Knowledge",
    color: "text-green-600",
    bgColor: "bg-green-50",
    activeColor: "bg-green-100 text-green-700 border-green-200",
  },
  {
    name: "Learn",
    href: "/learn",
    icon: BookOpen,
    description: "Interactive Lessons",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    activeColor: "bg-orange-100 text-orange-700 border-orange-200",
  },
]

const bottomItems = [
  {
    name: "Community",
    href: "/community",
    icon: Users,
    color: "text-purple-600",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    color: "text-gray-600",
  },
  {
    name: "Help",
    href: "/help",
    icon: HelpCircle,
    color: "text-indigo-600",
  },
]

export default function SidebarLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Stats Card - Updated to use real progress data
  const [userProgress, setUserProgress] = useState(null)

  useEffect(() => {
    // Fetch user progress for sidebar
    const fetchProgress = async () => {
      try {
        const response = await fetch("/api/user-progress?userId=user123")
        const data = await response.json()
        if (data.success) {
          setUserProgress(data.data)
        }
      } catch (error) {
        console.error("Error fetching progress:", error)
      }
    }

    fetchProgress()
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-white to-green-600 rounded-xl flex items-center justify-center border border-orange-200">
                <BookOpen className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  संविधान Learn
                </span>
                <div className="text-xs text-gray-500">Constitutional Platform</div>
              </div>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group border",
                      isActive
                        ? item.activeColor + " shadow-sm"
                        : "hover:bg-gray-50 border-transparent hover:border-gray-200",
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                        isActive ? item.bgColor : "bg-gray-100 group-hover:bg-gray-200",
                      )}
                    >
                      <Icon className={cn("w-5 h-5 transition-colors", isActive ? item.color : "text-gray-600")} />
                    </div>
                    <div className="flex-1">
                      <div
                        className={cn("font-semibold transition-colors", isActive ? "text-gray-900" : "text-gray-700")}
                      >
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                    {isActive && <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>}
                  </Link>
                )
              })}
            </nav>

            {/* Stats Card */}
            <div className="mx-4 mt-8 p-4 bg-gradient-to-r from-orange-50 to-green-50 rounded-xl border border-orange-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Your Progress</div>
                  <div className="text-xs text-gray-600">Keep learning!</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Articles Learned</span>
                  <span className="font-semibold text-orange-600">{userProgress?.totalArticlesRead || 0}/395</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${userProgress?.progressPercentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-1">
              {bottomItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-white to-green-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-orange-700" />
            </div>
            <span className="font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              संविधान Learn
            </span>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  )
}