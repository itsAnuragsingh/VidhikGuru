"use client"

import SidebarLayout from "@/components/sidebar-layout"
import ARDocumentScanner from "@/components/ar-document-scanner"

export default function ScannerPage() {
  return (
    <SidebarLayout>
      <ARDocumentScanner userId="user_123" />
    </SidebarLayout>
  )
}
