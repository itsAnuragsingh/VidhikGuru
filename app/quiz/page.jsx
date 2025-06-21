"use client"

import SidebarLayout from "@/components/sidebar-layout"
import DynamicQuiz from "@/components/dynamic-quiz"

export default function QuizPage() {
  // You can pass user ID from your auth system
  const userId = "user_123" // Replace with actual user ID from your auth

  return (
    <SidebarLayout>
      <DynamicQuiz userId={userId} />
    </SidebarLayout>
  )
}
