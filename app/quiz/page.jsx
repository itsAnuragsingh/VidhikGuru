"use client"

import SidebarLayout from "@/components/sidebar-layout"
import DynamicQuiz from "@/components/dynamic-quiz"
import { useUser } from "@civic/auth/react";
export default function QuizPage() {
  const { user } = useUser();
  // You can pass user ID from your auth system
  const userId = user?.id || "user_123" // Replace with actual user ID from your auth

  return (
    <SidebarLayout>
      <DynamicQuiz userId={userId} />
    </SidebarLayout>
  )
}
