"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Send,
  Bot,
  User,
  Sparkles,
  Scale,
  BookOpen,
  Gavel,
  Shield,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react"
import { useUser } from "@civic/auth/react";
import Image from "next/image";
export default function FullPageChat() {
  const { user } = useUser();
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content:
        "🙏 Namaste " + user?.name + "! I'm your Constitutional AI Assistant. I'm here to help you understand India's Constitution, fundamental rights, duties, and legal principles. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickQuestions, setShowQuickQuestions] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState("online")
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // 🔧 SIMPLE CONFIGURATION - CHANGE THIS TO SWITCH MODES
  const USE_PRODUCTION_API = true // Change to true to use your /api/chat endpoint

  const quickQuestions = [
    {
      id: "1",
      question: "What are Fundamental Rights?",
      icon: <Shield className="w-3 h-3" />,
      category: "Rights",
      color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
    },
    {
      id: "2",
      question: "Explain Directive Principles",
      icon: <Scale className="w-3 h-3" />,
      category: "Principles",
      color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
    },
    {
      id: "3",
      question: "What is Article 370?",
      icon: <BookOpen className="w-3 h-3" />,
      category: "Articles",
      color: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
    },
    {
      id: "4",
      question: "Amendment Process",
      icon: <Gavel className="w-3 h-3" />,
      category: "Process",
      color: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
    },
    {
      id: "5",
      question: "Fundamental Duties",
      icon: <Sparkles className="w-3 h-3" />,
      category: "Duties",
      color: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 🚀 PRODUCTION API CALL - Simple version for your /api/chat
  const callProductionAPI = async (query) => {
    try {
      setConnectionStatus("connecting")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query, // Your API expects 'query' parameter
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }


      const data = await response.json()
      setConnectionStatus("online")

      return {
        message: data.answer || data.response || data.message || "No response received",
        error: null,
      }
    } catch (error) {
      console.error("Production API Error:", error)
      setConnectionStatus("offline")
      return {
        message: "",
        error: "Failed to get response from server. Please try again.",
      }
    }
  }

  // 🎭 DUMMY DATA - Current working version
  const getDummyResponse = (question) => {
    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes("fundamental rights")) {
      return {
        message: `🏛️ **Fundamental Rights in the Indian Constitution**

The Indian Constitution guarantees **6 Fundamental Rights** to all citizens:

**1. Right to Equality (Articles 14-18)**
• Equality before law and equal protection of laws
• Prohibition of discrimination on grounds of religion, race, caste, sex, or place of birth
• Abolition of untouchability and titles

**2. Right to Freedom (Articles 19-22)**
• Freedom of speech and expression
• Freedom to assemble peacefully
• Freedom to form associations or unions
• Freedom of movement and residence

**3. Right against Exploitation (Articles 23-24)**
• Prohibition of traffic in human beings and forced labor
• Prohibition of employment of children in hazardous work

**4. Right to Freedom of Religion (Articles 25-28)**
• Freedom of conscience and free profession, practice and propagation of religion
• Freedom to manage religious affairs

**5. Cultural and Educational Rights (Articles 29-30)**
• Protection of interests of minorities
• Right of minorities to establish and administer educational institutions

**6. Right to Constitutional Remedies (Article 32)**
• Right to move Supreme Court for enforcement of Fundamental Rights
• Dr. Ambedkar called it the "Heart and Soul" of the Constitution

💡 These rights are enforceable by courts and form the foundation of Indian democracy!`,
        error: null,
      }
    }

    if (lowerQuestion.includes("directive principles")) {
      return {
        message: `📜 **Directive Principles of State Policy (DPSP)**

**What are DPSPs?**
• Guidelines for the Central and State governments in making laws and policies
• Contained in Part IV (Articles 36-51) of the Constitution
• Based on the Irish Constitution

**Key Features:**
✅ **Not enforceable by courts** (unlike Fundamental Rights)
✅ **Positive obligations** on the state
✅ **Aim to establish a welfare state**

**Important DPSPs:**
🎯 **Article 39** - Equal means of livelihood for all
🎯 **Article 41** - Right to work, education, and public assistance
🎯 **Article 44** - Uniform Civil Code
🎯 **Article 45** - Free and compulsory education for children
🎯 **Article 48** - Protection of cows and cattle

**Significance:**
• Complement Fundamental Rights
• Provide socio-economic justice
• Guide government policy-making
• Basis for many welfare schemes

🌟 **"Constitution is not a mere lawyers' document, it is a vehicle of Life"** - Dr. B.R. Ambedkar`,
        error: null,
      }
    }

    if (lowerQuestion.includes("article 370")) {
      return {
        message: `🏔️ **Article 370 - Special Status of Jammu & Kashmir**

**Historical Background:**
• Granted special autonomous status to J&K
• Incorporated in 1949 as a "temporary provision"
• Based on Instrument of Accession signed by Maharaja Hari Singh

**What it Provided:**
🔹 **Separate Constitution** for J&K
🔹 **Limited Central Laws** applicable
🔹 **Special Flag** alongside Indian tricolor  
🔹 **Dual Citizenship** concept
🔹 **Property Rights** restricted to permanent residents

**Current Status (Post August 5, 2019):**
❌ **Article 370 ABROGATED** by Presidential Order
❌ **Article 35A REVOKED** 
✅ **Bifurcated** into two Union Territories:
   • Jammu & Kashmir (with legislature)
   • Ladakh (without legislature)

**Legal Process:**
• Used Article 370(3) to revoke Article 370 itself
• Constitutional validity challenged in Supreme Court
• Cases still pending judicial review

**Impact:**
• Full integration with Indian legal system
• All Central laws now applicable
• Debate continues on constitutional propriety

⚖️ This remains one of the most significant constitutional changes in recent Indian history!`,
        error: null,
      }
    }

    if (lowerQuestion.includes("amendment")) {
      return {
        message: `⚖️ **Constitutional Amendment Process in India**

**Article 368** provides the power and procedure for constitutional amendments.

**Three Types of Amendment Procedures:**

**1. Simple Majority (Article 368 not applicable)**
• Requires majority of members present and voting
• Examples: Creation of new states, citizenship provisions
• Used for less critical provisions

**2. Special Majority (Article 368 applicable)**
• Requires **2/3rd majority** of members present + **absolute majority** of total membership
• Used for most constitutional amendments
• Examples: Fundamental Rights, DPSP, Supreme Court powers

**3. Special Majority + State Ratification**
• Special majority in Parliament + ratification by **50% of state legislatures**
• For provisions affecting federal structure
• Examples: Election of President, distribution of legislative powers

**Key Amendments:**
🔸 **1st Amendment (1951)** - Land reforms, restrictions on free speech
🔸 **42nd Amendment (1976)** - "Mini Constitution" - added Socialist, Secular, Integrity
🔸 **44th Amendment (1978)** - Restored some provisions changed by 42nd
🔸 **73rd & 74th (1992)** - Panchayati Raj and Urban Local Bodies
🔸 **101st Amendment (2016)** - GST implementation

**Basic Structure Doctrine:**
• Established in **Kesavananda Bharati case (1973)**
• Parliament cannot alter the "basic structure" of Constitution
• Includes: Supremacy of Constitution, Rule of Law, Independence of Judiciary

📊 **Total Amendments:** 105 (as of 2021)

💡 India's amendment process balances flexibility with stability!`,
        error: null,
      }
    }

    if (lowerQuestion.includes("fundamental duties")) {
      return {
        message: `🇮🇳 **Fundamental Duties of Indian Citizens**

**Added by 42nd Amendment (1976)** - Originally 10 duties, now **11 duties** under **Article 51A**

**The 11 Fundamental Duties:**

**1. Constitutional Respect** 🏛️
• Abide by Constitution and respect its ideals, institutions, National Flag and National Anthem

**2. Freedom Struggle Values** ✊
• Cherish and follow noble ideals of national struggle for freedom

**3. Unity & Integrity** 🤝
• Uphold and protect sovereignty, unity and integrity of India

**4. National Defense** 🛡️
• Defend the country and render national service when called upon

**5. Harmony & Brotherhood** 🕊️
• Promote harmony and spirit of common brotherhood among all people

**6. Composite Culture** 🎭
• Value and preserve rich heritage of composite culture

**7. Environment Protection** 🌱
• Protect and improve natural environment (forests, lakes, rivers, wildlife)

**8. Scientific Temper** 🔬
• Develop scientific temper, humanism and spirit of inquiry and reform

**9. Public Property** 🏢
• Safeguard public property and abjure violence

**10. Excellence** 🎯
• Strive towards excellence in all spheres of individual and collective activity

**11. Education** 📚 *(Added by 86th Amendment, 2002)*
• Provide opportunities for education to children between 6-14 years

**Key Points:**
❗ **Not enforceable by law** (unlike Fundamental Rights)
❗ **Moral obligations** on citizens
❗ **Inspired by USSR Constitution**
❗ **Complement Fundamental Rights**

🌟 **"Rights and duties are correlative"** - Where there are rights, there must be corresponding duties!`,
        error: null,
      }
    }

    // Default response
    return {
      message: `🏛️ That's an excellent constitutional question! The Indian Constitution, adopted on January 26, 1950, is a comprehensive document that establishes the framework of our democratic republic. 

Could you please be more specific about which aspect you'd like to explore? I can help with:
• Fundamental Rights and Duties
• Directive Principles of State Policy  
• Constitutional Amendments
• Separation of Powers
• Federal Structure
• Judicial Review

Feel free to ask about any specific article, amendment, or constitutional concept!`,
      error: null,
    }
  }

  // 🔄 MAIN RESPONSE HANDLER
  const getAIResponse = async (question) => {
    if (USE_PRODUCTION_API) {
      // 🚀 Use Production API
      return await callProductionAPI(question)
    } else {
      // 🎭 Use Dummy Data
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000)) // Simulate delay
      return getDummyResponse(question)
    }
  }

  const simulateTyping = async (response) => {
    setIsTyping(true)
    setShowQuickQuestions(false)

    // Add typing indicator
    const typingMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    }

    setMessages((prev) => [...prev, typingMessage])

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Remove typing indicator and add actual response
    setMessages((prev) => prev.filter((msg) => !msg.isTyping))

    const assistantMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: response.error || response.message,
      timestamp: new Date(),
      error: !!response.error,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleSend = async (questionText) => {
    const messageText = questionText || input.trim()
    if (!messageText || isLoading) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Get AI response
      const response = await getAIResponse(messageText)
      await simulateTyping(response)
    } catch (error) {
      console.error("Error getting AI response:", error)

      // Add error message
      const errorMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
        error: true,
      }

      setMessages((prev) => [...prev, errorMessage])
      setConnectionStatus("offline")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question) => {
    handleSend(question)
  }

  const handleRetry = (messageContent) => {
    handleSend(messageContent)
  }

  const formatMessage = (content) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <div key={index} className="font-bold text-gray-900 mb-2">
            {line.slice(2, -2)}
          </div>
        )
      }
      if (line.startsWith("🔸") || line.startsWith("🎯") || line.startsWith("✅") || line.startsWith("❗")) {
        return (
          <div key={index} className="ml-4 mb-1 text-gray-700">
            {line}
          </div>
        )
      }
      if (line.startsWith("•")) {
        return (
          <div key={index} className="ml-6 mb-1 text-gray-600">
            {line}
          </div>
        )
      }
      if (line.trim() === "") {
        return <div key={index} className="mb-2"></div>
      }
      return (
        <div key={index} className="mb-1 text-gray-700">
          {line}
        </div>
      )
    })
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Constitutional AI Assistant</h1>
              <p className="text-sm text-gray-500">
                {USE_PRODUCTION_API
                  ? "RAG-Powered AI Assistant"
                  : "Demo Mode - Expert in Indian Constitution & Legal Matters"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {connectionStatus === "online" && <Wifi className="w-4 h-4 text-green-500" />}
            {connectionStatus === "offline" && <WifiOff className="w-4 h-4 text-red-500" />}
            {connectionStatus === "connecting" && <RotateCcw className="w-4 h-4 text-yellow-500 animate-spin" />}
            <div
              className={`w-2 h-2 rounded-full ${connectionStatus === "online"
                  ? "bg-green-500"
                  : connectionStatus === "offline"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
            ></div>
            <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} group`}>
            <div
              className={`flex items-start space-x-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === "user"
                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                    : message.error
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                  }`}
              >
                {/* {message.role === "user" ? (
                  // <User className="w-4 h-4 text-white" />
                  <Image src={user?.picture} className="w-4 h-4"/>
                ) : message.error ? (
                  <AlertCircle className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )} */}
                {message.role === "user" ? (
                  user?.picture ? (
                    <Image
                      src={user?.picture}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )
                ) : message.error ? (
                  <AlertCircle className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`relative ${message.role === "user"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : message.error
                      ? "bg-red-50 border border-red-200"
                      : "bg-gray-50 border border-gray-200"
                  } rounded-2xl px-4 py-3 shadow-sm`}
              >
                {message.isTyping ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-gray-500 text-sm">AI is thinking...</span>
                  </div>
                ) : (
                  <div
                    className={`${message.role === "user" ? "text-white" : message.error ? "text-red-800" : "text-gray-800"
                      }`}
                  >
                    {message.role === "assistant" ? formatMessage(message.content) : message.content}
                  </div>
                )}

                {/* Message Actions */}
                {!message.isTyping && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>

                    <div className="flex items-center space-x-2">
                      {message.error && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRetry(message.content)}
                          className="h-6 px-2 text-xs hover:bg-gray-200"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      )}

                      {message.role === "assistant" && !message.error && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyMessage(message.content)}
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-200">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-200">
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
        {/* Quick Questions */}
        {showQuickQuestions && messages.length <= 1 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <Button
                  key={q.id}
                  onClick={() => handleQuickQuestion(q.question)}
                  variant="outline"
                  size="sm"
                  className={`h-8 px-3 text-xs border ${q.color} transition-all duration-200`}
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-1">
                    {q.icon}
                    <span>{q.question}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Connection Status Warning */}
        {connectionStatus === "offline" && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">Connection lost. Please check your internet connection.</span>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={
                connectionStatus === "offline"
                  ? "Connection lost - please check your internet..."
                  : "Ask me anything about the Indian Constitution..."
              }
              className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 placeholder-gray-500 ${connectionStatus === "offline"
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
                }`}
              disabled={isLoading || connectionStatus === "offline"}
            />
          </div>

          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || connectionStatus === "offline"}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
          <Shield className="w-3 h-3 mr-1" />
          {USE_PRODUCTION_API ? (
            <>RAG-Powered Constitutional AI • Real-time Legal Information • Always Verify Important Decisions</>
          ) : (
            <>Demo Mode Active • Switch to Production API for Real RAG Responses • Constitutional Learning Platform</>
          )}
        </div>
      </div>
    </div>
  )
}