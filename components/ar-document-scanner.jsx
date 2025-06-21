"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, Scan, BookOpen, MessageCircle, Upload, History, X, Loader2, FileText, Eye, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function ARDocumentScanner({ userId = "user_123" }) {
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scannedResult, setScannedResult] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [stream, setStream] = useState(null)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrStatus, setOcrStatus] = useState("")
  const [cameraError, setCameraError] = useState("")

  // AI Chat states
  const [showAIChat, setShowAIChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isAIThinking, setIsAIThinking] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)

  // Auto scroll chat to bottom - IMPROVED VERSION
  useEffect(() => {
    if (chatEndRef.current && chatMessages.length > 0) {
      // Only auto-scroll if user is near the bottom or it's a new message
      const chatContainer = chatEndRef.current.parentElement?.parentElement
      if (chatContainer) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainer
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

        // Auto-scroll only if near bottom or it's the first message
        if (isNearBottom || chatMessages.length === 1) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }
    }
  }, [chatMessages])

  // Check camera permissions and capabilities
  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError("Camera not supported in this browser")
          return
        }

        // Check if we have camera permissions
        const permissions = await navigator.permissions.query({ name: "camera" })
        if (permissions.state === "denied") {
          setCameraError("Camera permission denied")
        }
      } catch (error) {
        console.log("Camera check error:", error)
      }
    }

    checkCameraSupport()
  }, [])

  const startCamera = async () => {
    try {
      setCameraError("")

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream

        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setStream(mediaStream)
          setIsScanning(true)
          toast.success("Camera started successfully!")
        }
      }
    } catch (error) {
      console.error("Camera access error:", error)
      let errorMessage = "Camera access failed"

      if (error.name === "NotAllowedError") {
        errorMessage = "Camera permission denied. Please allow camera access and try again."
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on this device."
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera is being used by another application."
      }

      setCameraError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop()
      })
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready")
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // Draw the current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to data URL
    return canvas.toDataURL("image/jpeg", 0.8)
  }, [])

  // Fixed Tesseract.js implementation with proper error handling
  const processImageWithTesseract = async (imageData) => {
    setIsProcessing(true)
    setOcrProgress(0)
    setOcrStatus("Initializing OCR...")

    let worker = null

    try {
      // Dynamic import to avoid SSR issues
      const Tesseract = await import("tesseract.js")

      setOcrStatus("Loading OCR engine...")
      setOcrProgress(10)

      // Create worker with proper configuration
      worker = await Tesseract.createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const progress = Math.round(m.progress * 80) + 10 // 10-90%
            setOcrProgress(progress)
            setOcrStatus(`Recognizing text... ${Math.round(m.progress * 100)}%`)
          }
        },
        errorHandler: (err) => {
          console.error("Tesseract worker error:", err)
        },
      })

      setOcrStatus("Processing image...")
      setOcrProgress(20)

      // Initialize worker properly
      await worker.loadLanguage("eng")
      await worker.initialize("eng")

      // Set parameters for better accuracy
      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()[]{}\"-' \n\t",
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      })

      setOcrStatus("Extracting text...")
      setOcrProgress(30)

      // Process the image
      const {
        data: { text, confidence },
      } = await worker.recognize(imageData)

      // Terminate worker
      await worker.terminate()
      worker = null

      if (!text || text.trim().length < 10) {
        throw new Error("No meaningful text detected in image")
      }

      setOcrStatus("Processing detected text...")
      setOcrProgress(90)

      // Send to server for legal term detection
      const serverResponse = await fetch("/api/scan-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedText: text.trim(),
          confidence: confidence / 100,
          userId,
        }),
      })

      const data = await serverResponse.json()

      if (data.success) {
        setScannedResult(data.data)
        toast.success(`OCR Success! Found ${data.data.detectedTerms.length} legal terms!`)
        setOcrProgress(100)
        setOcrStatus("OCR Complete!")
      } else {
        throw new Error(data.error || "Failed to process document")
      }
    } catch (error) {
      console.error("OCR processing error:", error)

      // Clean up worker if it exists
      if (worker) {
        try {
          await worker.terminate()
        } catch (e) {
          console.error("Error terminating worker:", e)
        }
      }

      // Show specific error messages
      let errorMessage = "OCR processing failed"

      if (error.message.includes("No meaningful text")) {
        errorMessage = "No text detected. Try a clearer image with more text."
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Check your connection and try again."
      } else if (error.message.includes("worker")) {
        errorMessage = "OCR engine error. Try refreshing the page."
      }

      toast.error(errorMessage)

      // Ask user if they want to try demo mode
      setTimeout(() => {
        if (confirm("OCR failed. Would you like to try demo mode instead?")) {
          processDemoData()
        } else {
          setIsProcessing(false)
          setOcrProgress(0)
          setOcrStatus("")
        }
      }, 1000)
    } finally {
      // Clean up if still processing
      setTimeout(() => {
        if (isProcessing) {
          setIsProcessing(false)
          setOcrProgress(0)
          setOcrStatus("")
        }
      }, 2000)
    }
  }

  // Demo data processing
  const processDemoData = async () => {
    const demoTexts = [
      {
        text: `EMPLOYMENT CONTRACT

This agreement is entered into between the plaintiff company and the defendant employee.
The terms of this contract are governed by fundamental rights under Article 16 of the Constitution.

TERMS AND CONDITIONS:
1. The employee has the right to due process in any disciplinary action
2. Any disputes shall be resolved through proper jurisdiction of competent courts
3. The company shall not violate any directive principles in employment practices
4. Either party may seek an injunction in case of breach of contract
5. Bail provisions do not apply to civil contract disputes

This contract respects all constitutional provisions and civil procedure requirements.
Any writ of habeas corpus or other legal remedies remain available to both parties.`,
        type: "contract",
      },
      {
        text: `LEGAL NOTICE

TO: The Defendant
FROM: The Plaintiff

You are hereby notified that a legal action will be commenced against you for violation
of fundamental rights guaranteed under Articles 14, 19, and 21 of the Constitution.

The court has jurisdiction over this matter under Article 32. You have the right to
due process and may apply for bail if criminal charges are filed.

An injunction may be sought to prevent further violations. This notice complies with
all directive principles and constitutional requirements.

A writ of habeas corpus may be filed if there is any unlawful detention.`,
        type: "legal_notice",
      },
      {
        text: `IN THE HIGH COURT OF JUSTICE

Case No: HC/2024/123
Between: The Plaintiff vs The Defendant

ORDER

This court has jurisdiction to hear this matter under Article 226 of the Constitution.
The fundamental rights of the parties under Articles 14 and 21 must be protected.

The court orders:
1. An injunction is granted restraining the defendant
2. Bail is granted to the accused on furnishing surety
3. Due process must be followed in all proceedings
4. Any writ of habeas corpus applications will be heard expeditiously

This order is in accordance with directive principles and constitutional provisions.`,
        type: "court_document",
      },
    ]

    const randomDemo = demoTexts[Math.floor(Math.random() * demoTexts.length)]

    try {
      setOcrStatus("Processing legal document...")
      setOcrProgress(90)

      const serverResponse = await fetch("/api/scan-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedText: randomDemo.text.trim(),
          confidence: 0.85,
          userId,
        }),
      })

      const data = await serverResponse.json()

      if (data.success) {
        setScannedResult(data.data)
        toast.success(`Found ${data.data.detectedTerms.length} legal terms!`)
        setOcrProgress(100)
        setOcrStatus("Analysis complete!")
      } else {
        throw new Error(data.error || "Failed to process document")
      }
    } catch (error) {
      console.error("Demo data processing error:", error)
      toast.error("Failed to process document: " + error.message)
    }
  }

  const handleCapture = () => {
    const imageData = captureImage()
    if (imageData) {
      stopCamera()
      processImageWithTesseract(imageData)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Please select an image smaller than 10MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result
      if (imageData) {
        // Preprocess image for better OCR
        preprocessImageForOCR(imageData)
      }
    }
    reader.onerror = () => {
      toast.error("Failed to read image file")
    }
    reader.readAsDataURL(file)
  }

  // Add image preprocessing function
  const preprocessImageForOCR = (imageData) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      // Set canvas size
      canvas.width = img.width
      canvas.height = img.height

      // Draw image
      ctx.drawImage(img, 0, 0)

      // Get image data for preprocessing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Simple contrast enhancement
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale and enhance contrast
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        const enhanced = gray > 128 ? 255 : 0 // Simple thresholding

        data[i] = enhanced // Red
        data[i + 1] = enhanced // Green
        data[i + 2] = enhanced // Blue
        // Alpha stays the same
      }

      // Put processed image data back
      ctx.putImageData(imageData, 0, 0)

      // Convert to data URL and process
      const processedImageData = canvas.toDataURL("image/jpeg", 0.9)
      processImageWithTesseract(processedImageData)
    }

    img.onerror = () => {
      toast.error("Failed to preprocess image")
    }

    img.src = imageData
  }

  const generateQuiz = async () => {
    if (!scannedResult) return

    try {
      const response = await fetch(`/api/scan-document/${scannedResult.documentId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Quiz generated successfully!")
      } else {
        toast.error("Failed to generate quiz")
      }
    } catch (error) {
      console.error("Quiz generation error:", error)
      toast.error("Failed to generate quiz")
    }
  }

  // AI Chat Functions
  const openAIChat = () => {
    if (!scannedResult) {
      toast.error("Please scan a document first")
      return
    }

    setShowAIChat(true)

    // Initialize chat with document context
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          role: "assistant",
          content: `Hello! I'm here to help you understand this ${scannedResult.documentType.replace("_", " ")}. I can explain legal terms, answer questions about the document, or help you understand specific clauses. What would you like to know?`,
          timestamp: new Date(),
        },
      ])
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || isAIThinking) return

    const userMessage = {
      role: "user",
      content: currentMessage.trim(),
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsAIThinking(true)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage.trim(),
          documentContext: {
            text: scannedResult.text,
            documentType: scannedResult.documentType,
            detectedTerms: scannedResult.detectedTerms,
            summary: scannedResult.summary,
          },
          chatHistory: chatMessages.slice(-5), // Last 5 messages for context
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, aiMessage])
      } else {
        throw new Error(data.error || "AI response failed")
      }
    } catch (error) {
      console.error("AI chat error:", error)
      const errorMessage = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
      toast.error("AI chat failed. Please try again.")
    } finally {
      setIsAIThinking(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const loadScanHistory = async () => {
    try {
      const response = await fetch(`/api/scan-history?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setScanHistory(data.data)
        setShowHistory(true)
      }
    } catch (error) {
      console.error("History loading error:", error)
      toast.error("Failed to load scan history")
    }
  }

  const resetScanner = () => {
    setScannedResult(null)
    setSelectedTerm(null)
    setChatMessages([])
    setShowAIChat(false)
    stopCamera()
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Legal Document Scanner</h1>
              <p className="text-sm text-gray-600">Smart document analysis with AI assistance</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={loadScanHistory}>
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            {scannedResult && (
              <Button variant="outline" onClick={resetScanner}>
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {!scannedResult ? (
          <div className="h-full relative">
            {isScanning ? (
              <div className="relative h-full bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }} // Mirror effect for front camera
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Top overlay */}
                  <div className="absolute top-4 left-4 right-4 z-10">
                    <Card className="bg-black/80 text-white border-white/20">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm">Position document in frame</span>
                          </div>
                          <Button size="sm" variant="secondary" onClick={stopCamera} className="pointer-events-auto">
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Document frame guide */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-80 h-60 border-2 border-white/50 rounded-lg relative">
                      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-white"></div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-white"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-white"></div>
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-white"></div>
                    </div>
                  </div>

                  {/* Capture Button */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                    <Button
                      size="lg"
                      onClick={handleCapture}
                      className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-100 pointer-events-auto shadow-lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto p-6">
                  <Scan className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Scan Legal Documents</h3>
                  <p className="text-gray-600 mb-8">
                    Capture or upload legal documents to analyze and detect legal terms automatically.
                  </p>

                  {cameraError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{cameraError}</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="mb-6">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">{ocrStatus}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{ocrProgress}% complete</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Button
                      onClick={startCamera}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                      disabled={isProcessing || !!cameraError}
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      {cameraError ? "Camera Unavailable" : "Start Camera"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      size="lg"
                      disabled={isProcessing}
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Image
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 text-gray-500">or</span>
                      </div>
                    </div>

                    <Button
                      onClick={processDemoData}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      disabled={isProcessing}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Try Demo Document
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div className="text-xs text-gray-500 mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium mb-1">AI Assistant:</p>
                      <p>
                        After scanning, you can ask AI questions about the document, legal terms, and get explanations!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Document Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Document Analysis</span>
                    </CardTitle>
                    <Badge variant="secondary">{scannedResult.documentType.replace("_", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{scannedResult.summary}</p>
                  <div className="flex space-x-2">
                    <Button onClick={generateQuiz} className="bg-blue-600 hover:bg-blue-700">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Generate Quiz
                    </Button>
                    <Button onClick={openAIChat} className="bg-green-600 hover:bg-green-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask AI About This
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Detected Legal Terms */}
              <Card>
                <CardHeader>
                  <CardTitle>Detected Legal Terms ({scannedResult.detectedTerms.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scannedResult.detectedTerms.map((term, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-purple-500"
                        onClick={() => setSelectedTerm(term)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-purple-700">{term.term}</h4>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{term.definition}</p>
                          {term.category && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {term.category}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Original Text */}
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40 w-full rounded border p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{scannedResult.text}</pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Modal - FIXED SCROLLING VERSION */}
      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span>AI Legal Assistant</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0 p-6 overflow-hidden">
            {/* Chat Messages Container - FIXED SCROLLING */}
            <div className="flex-1 border rounded-lg mb-4 flex flex-col min-h-0 overflow-hidden bg-gray-50">
              <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "100%" }}>
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white text-gray-900 rounded-bl-sm shadow-sm border"
                        }`}
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          hyphens: "auto",
                        }}
                      >
                        <div
                          className="text-sm leading-relaxed"
                          style={{
                            whiteSpace: "pre-wrap",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            maxWidth: "100%",
                          }}
                        >
                          {message.content}
                        </div>
                        <div
                          className={`text-xs mt-2 text-right ${
                            message.role === "user" ? "opacity-70" : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isAIThinking && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 p-3 rounded-lg rounded-bl-sm max-w-[70%] shadow-sm border">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </div>
            </div>

            {/* Message Input Container */}
            <div className="flex-shrink-0 space-y-3">
              {/* Quick Questions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMessage("What are the key legal terms in this document?")}
                  disabled={isAIThinking}
                  className="text-xs"
                >
                  Key Terms
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMessage("Explain the main purpose of this document")}
                  disabled={isAIThinking}
                  className="text-xs"
                >
                  Document Purpose
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMessage("What are my rights and obligations here?")}
                  disabled={isAIThinking}
                  className="text-xs"
                >
                  Rights & Obligations
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMessage("Are there any potential legal issues I should be aware of?")}
                  disabled={isAIThinking}
                  className="text-xs"
                >
                  Legal Issues
                </Button>
              </div>

              {/* Input Row */}
              <div className="flex space-x-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about legal terms, document meaning, or specific clauses..."
                  disabled={isAIThinking}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isAIThinking}
                  className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Term Details Modal */}
      <Dialog open={!!selectedTerm} onOpenChange={() => setSelectedTerm(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-purple-700">{selectedTerm?.term}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Definition</h4>
              <p className="text-gray-700">{selectedTerm?.definition}</p>
            </div>
            {selectedTerm?.category && (
              <div>
                <h4 className="font-semibold mb-2">Category</h4>
                <Badge variant="secondary">{selectedTerm.category}</Badge>
              </div>
            )}
            {selectedTerm?.relatedArticles?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Related Articles</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTerm.relatedArticles.map((article, index) => (
                    <Badge key={index} variant="outline">
                      {article}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {selectedTerm?.examples?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Examples</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedTerm.examples.map((example, index) => (
                    <li key={index} className="text-gray-700 text-sm">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Scan History</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {scanHistory.map((doc) => (
                <Card key={doc._id} className="cursor-pointer hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{doc.documentType.replace("_", " ")}</Badge>
                      <span className="text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{doc.summary}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{doc.detectedTerms.length} terms detected</span>
                      {doc.generatedQuizId && <Badge variant="outline">Quiz Available</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
