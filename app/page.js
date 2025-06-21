"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, MessageCircle, Star, Trophy, Sparkles, Users, Shield } from "lucide-react"
import Link from "next/link"
import { UserButton } from "@civic/auth/react"
import { useUser } from "@civic/auth/react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const bookRef = useRef(null)
  const { user } = useUser()
  console.log("User:", user)
  const router = useRouter()

  useEffect(() => {
    // Redirect to /learn if user is logged in
    if (user) {
      router.push("/learn")
    }
  }, [user])

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      // Clear any existing ScrollTriggers
      ScrollTrigger.getAll().forEach((t) => t.kill())

      // Set ALL elements to their starting positions
      gsap.set(".book-cover-front", {
        rotationY: 0,
        transformOrigin: "left center",
      })
      gsap.set(".book-page", {
        rotationY: 0,
        transformOrigin: "left center",
      })
      gsap.set(".book-cover-back", {
        rotationY: 0,
        transformOrigin: "left center",
      })

      // Create ONE simple timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#book-animation-section",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: "#book-container",
          pinSpacing: true,
          onUpdate: (self) => {
            // Update progress bar
            const progress = self.progress * 100
            const progressBar = document.querySelector(".scroll-progress")
            if (progressBar) {
              progressBar.style.width = `${progress}%`
            }
          },
        },
      })

      // Animation sequence:
      // 1. Front cover opens (0-30%)
      tl.to(".book-cover-front", {
        rotationY: -180,
        duration: 0.3,
        ease: "power2.inOut",
      })

      // 2. Pages turn one by one (30-80%)
      const pages = document.querySelectorAll(".book-page")
      pages.forEach((page, i) => {
        tl.to(
          page,
          {
            rotationY: -180,
            duration: 0.06,
            ease: "power1.inOut",
          },
          0.3 + i * 0.06,
        )
      })

      // 3. Back cover closes (80-100%)
      tl.to(
        ".book-cover-back",
        {
          rotationY: -180,
          duration: 0.2,
          ease: "power2.inOut",
        },
        0.8,
      )

      // Simple floating animation for the whole book
      gsap.to(bookRef.current, {
        y: "+=10",
        duration: 3,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      })
    }

    loadGSAP()

    return () => {
      if (typeof window !== "undefined") {
        const { ScrollTrigger } = require("gsap/ScrollTrigger")
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }
  }, [])

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const constitutionalContent = [
    {
      title: "भारत का संविधान",
      subtitle: "Constitution of India",
      content:
        "We, the people of India, having solemnly resolved to constitute India into a sovereign socialist secular democratic republic and to secure to all its citizens justice, liberty, equality and fraternity...",
    },
    {
      title: "Article 14",
      subtitle: "Right to Equality",
      content:
        "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India. This fundamental right ensures equal treatment regardless of religion, race, caste, sex or place of birth.",
    },
    {
      title: "Article 19",
      subtitle: "Protection of Rights",
      content:
        "All citizens shall have the right to freedom of speech and expression; to assemble peaceably and without arms; to form associations or unions; to move freely throughout the territory of India; to reside and settle in any part of the territory of India.",
    },
    {
      title: "Article 21",
      subtitle: "Right to Life",
      content:
        "No person shall be deprived of his life or personal liberty except according to procedure established by law. This article is the heart of fundamental rights and has been expanded through judicial interpretation to include right to privacy, education, and clean environment.",
    },
    {
      title: "Article 32",
      subtitle: "Constitutional Remedies",
      content:
        "The right to move the Supreme Court by appropriate proceedings for the enforcement of fundamental rights is guaranteed. Dr. B.R. Ambedkar called this the 'heart and soul' of the Constitution and the 'very essence' of the Constitution.",
    },
    {
      title: "Article 51A",
      subtitle: "Fundamental Duties",
      content:
        "It shall be the duty of every citizen of India to abide by the Constitution and respect its ideals and institutions, the National Flag and the National Anthem; to cherish and follow the noble ideals which inspired our national struggle for freedom.",
    },
    {
      title: "Article 368",
      subtitle: "Amendment Power",
      content:
        "Parliament may in exercise of its constituent power amend by way of addition, variation or repeal any provision of this Constitution in accordance with the procedure laid down in this article, subject to the basic structure doctrine.",
    },
    {
      title: "Directive Principles",
      subtitle: "State Policy Guidelines",
      content:
        "The State shall strive to promote the welfare of the people by securing and protecting as effectively as it may a social order in which justice, social, economic and political, shall inform all institutions of national life.",
    },
  ]

  const floatingQuotes = [
    "Justice, Liberty, Equality, Fraternity",
    "Unity in Diversity",
    "Satyameva Jayate",
    "We, the People of India",
    "Sovereign Socialist Secular Democratic Republic",
    "Fundamental Rights & Duties",
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 z-50 border-b border-gray-100 shadow-lg backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-xl flex items-center justify-center border-2 border-orange-200">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-orange-700" />
            </div>
            <div>
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                VidhikGuru
              </span>
              <div className="text-xs text-gray-500 font-medium hidden sm:block">Constitutional Learning Platform</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Features
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              About
            </Link>
            {user ? (
              <Link href="/learn">
                <Button className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Learning
                </Button>
              </Link>
            ) : (
              <UserButton />
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user ? (
              <Link href="/learn">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-semibold px-3 py-1 rounded-lg text-sm"
                >
                  Learn
                </Button>
              </Link>
            ) : (
              <UserButton />
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              <Link
                href="#features"
                className="block text-gray-700 hover:text-orange-600 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="block text-gray-700 hover:text-orange-600 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-orange-300 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-green-300 rounded-full"></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 border-2 border-blue-300 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-orange-300 rounded-full"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-green-100 px-6 py-3 rounded-full mb-8 border border-orange-200">
              <Shield className="w-5 h-5 text-orange-600" />
              <span className="text-orange-700 font-semibold">India's #1 Constitutional Learning Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-6 md:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-orange-600 via-red-500 to-green-600 bg-clip-text text-transparent">
                Master the
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 via-blue-500 to-orange-600 bg-clip-text text-transparent">
                Constitution
              </span>
              <br />
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Like Never Before
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
              Experience India's Constitution through revolutionary{" "}
              <span className="font-bold text-orange-600">3D interactive book</span> technology.{" "}
              <span className="font-bold text-green-600">Learn, explore, and master</span> constitutional knowledge with
              AI-powered assistance.
            </p>

            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-8 md:mb-12 px-4">
              {[
                { icon: BookOpen, text: "3D Interactive Book" },
                { icon: MessageCircle, text: "AI Assistant" },
                { icon: Trophy, text: "Gamified Learning" },
                { icon: Users, text: "75K+ Learners" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white/80 px-3 md:px-4 py-2 rounded-full shadow-lg border border-gray-200 text-sm md:text-base"
                >
                  <item.icon className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 md:mb-12 px-4">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                🚀 Start Your Journey
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300"
              >
                📖 Watch Demo
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div className="flex flex-col items-center space-y-2 md:space-y-4 text-orange-600 animate-bounce">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-base md:text-lg font-semibold text-center px-4">
                Scroll down to witness the magic
              </span>
              <div className="w-1 h-12 md:h-16 bg-gradient-to-b from-orange-400 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Book Animation Section - THE SURPRISE! */}
      <section
        id="book-animation-section"
        className="h-[500vh] relative bg-gradient-to-b from-amber-50 via-orange-100 to-red-100"
      >
        {/* Majestic Constitutional Hall Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Golden Pillars */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 opacity-20"></div>
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-yellow-600 via-yellow-400 to-yellow-600 opacity-20"></div>
          <div className="absolute left-32 top-0 w-12 h-full bg-gradient-to-r from-yellow-500 to-yellow-300 opacity-15"></div>
          <div className="absolute right-32 top-0 w-12 h-full bg-gradient-to-l from-yellow-500 to-yellow-300 opacity-15"></div>

          {/* Marble Floor Pattern */}
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-gray-200 via-gray-100 to-transparent opacity-30"></div>
          <div className="absolute bottom-0 w-full h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 opacity-40"></div>

          {/* Constitutional Symbols Floating Around */}
          <div className="constitutional-symbol absolute top-20 left-1/4 w-16 h-16 text-yellow-600 opacity-30">⚖️</div>
          <div className="constitutional-symbol absolute top-32 right-1/4 w-12 h-12 text-orange-600 opacity-30">🏛️</div>
          <div className="constitutional-symbol absolute top-1/3 left-1/6 w-14 h-14 text-green-600 opacity-30">📜</div>
          <div className="constitutional-symbol absolute top-1/2 right-1/6 w-10 h-10 text-blue-600 opacity-30">⚖️</div>
          <div className="constitutional-symbol absolute bottom-1/3 left-1/5 w-12 h-12 text-red-600 opacity-30">🏛️</div>
          <div className="constitutional-symbol absolute bottom-1/4 right-1/5 w-16 h-16 text-purple-600 opacity-30">
            📜
          </div>

          {/* Floating Constitutional Quotes */}
          {floatingQuotes.map((quote, index) => (
            <div
              key={index}
              className={`floating-quote absolute text-lg font-semibold text-gray-600 opacity-20 ${
                index % 2 === 0 ? "left-8" : "right-8"
              }`}
              style={{
                top: `${20 + index * 12}%`,
                transform: index % 2 === 0 ? "rotate(-5deg)" : "rotate(5deg)",
              }}
            >
              "{quote}"
            </div>
          ))}

          {/* Golden Light Rays */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-yellow-300/20 via-yellow-200/10 to-transparent rounded-full"></div>
        </div>

        {/* Book Container */}
        <div id="book-container" className="h-screen flex items-center justify-center relative">
          {/* Golden Aura Effect */}
          <div className="golden-aura absolute inset-0 bg-gradient-radial from-yellow-400/30 via-orange-300/20 to-transparent rounded-full opacity-0 scale-75"></div>

          {/* Spotlight Effect */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-b from-yellow-200/10 via-transparent to-transparent pointer-events-none"></div>
          {/* The 3D Book */}
          <div className="book-container">
            <div ref={bookRef} className="constitution-book">
              {/* Book Spine */}
              <div className="book-spine"></div>

              {/* Front Cover */}
              <div className="book-cover-front">
                <div className="cover-content">
                  <div className="emblem">
                    <div className="ashoka-chakra"></div>
                  </div>
                  <h2 className="cover-title">भारत का संविधान</h2>
                  <h3 className="cover-subtitle">Constitution of India</h3>
                  <div className="cover-year">1950</div>
                  <div className="cover-motto">"सत्यमेव जयते"</div>
                </div>
              </div>

              {/* Book Pages */}
              {constitutionalContent.map((content, index) => (
                <div key={index} className={`book-page page-${index + 1}`} style={{ zIndex: 100 - index }}>
                  <div className="page-front">
                    <div className="page-content">
                      <div className="page-header">
                        <div className="article-badge">Article</div>
                        <div className="page-number">{index + 1}</div>
                      </div>
                      <h3 className="article-title">{content.title}</h3>
                      <h4 className="article-subtitle">{content.subtitle}</h4>
                      <p className="article-content">{content.content}</p>
                      <div className="page-footer">
                        <div className="constitutional-emblem">⚖️</div>
                      </div>
                    </div>
                  </div>
                  <div className="page-back">
                    <div className="page-content">
                      <div className="page-decoration">
                        <div className="decorative-border"></div>
                        <div className="constitutional-quote">
                          "The Constitution is not a mere lawyers' document, it is a vehicle of Life, and its spirit is
                          always the spirit of Age."
                        </div>
                        <div className="quote-author">- Dr. B.R. Ambedkar</div>
                        <div className="decorative-border"></div>
                        <div className="page-ornament">🏛️ ⚖️ 📜</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Back Cover */}
              <div className="book-cover-back">
                <div className="back-content">
                  <div className="tricolor saffron">
                    <div className="tricolor-text">Courage & Sacrifice</div>
                  </div>
                  <div className="tricolor white">
                    <div className="chakra"></div>
                    <div className="tricolor-text">Truth & Peace</div>
                  </div>
                  <div className="tricolor green">
                    <div className="tricolor-text">Faith & Chivalry</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-orange-200">
              <div className="text-orange-700 font-semibold mb-3">Constitutional Journey Progress</div>
              <div className="w-48 h-2 bg-orange-100 rounded-full overflow-hidden">
                <div className="scroll-progress h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-full transition-all duration-300"></div>
              </div>
              <div className="text-sm text-gray-600 mt-2">Scroll to explore articles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4 bg-blue-100 text-blue-700 px-4 py-1.5">Core Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Comprehensive Learning Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed to make constitutional learning engaging, interactive, and effective
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-lg"></div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl mb-2">Interactive Flashcards</CardTitle>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 mb-6">
                  Learn constitutional articles, amendments, and fundamental rights through engaging flashcards with
                  spaced repetition technology.
                </CardDescription>
                <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100">500+ Cards</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-delayed">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg"></div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl mb-2">AI Legal Assistant</CardTitle>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 mb-6">
                  Chat with our advanced AI to get instant answers about your rights, legal procedures, and
                  constitutional interpretations.
                </CardDescription>
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100">24/7 Available</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-more-delayed">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-lg"></div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl mb-2">Smart Quizzes</CardTitle>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 mb-6">
                  Test your understanding with adaptive quizzes covering all aspects of the Indian Constitution and
                  legal framework.
                </CardDescription>
                <Badge className="bg-green-50 text-green-700 hover:bg-green-100">1000+ Questions</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-most-delayed">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg"></div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl mb-2">Community Hub</CardTitle>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 mb-6">
                  Join a vibrant community of learners, share insights, and participate in discussions about
                  constitutional matters.
                </CardDescription>
                <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100">10K+ Members</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-gradient-to-r from-orange-600 via-red-500 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/50 to-green-600/50"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Trusted Across India</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of learners who have mastered constitutional knowledge with our platform
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {[
              { number: "75,000+", label: "Active Learners", icon: "👥", desc: "Students & Professionals" },
              { number: "395", label: "Articles Covered", icon: "📜", desc: "Complete Constitution" },
              { number: "104", label: "Amendments", icon: "✏️", desc: "Up to Date" },
              { number: "99.2%", label: "Success Rate", icon: "🎯", desc: "Learning Outcomes" },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                  <div className="text-6xl mb-4">{stat.icon}</div>
                  <div className="text-3xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-base md:text-xl font-semibold mb-2">{stat.label}</div>
                  <div className="text-xs md:text-sm opacity-75">{stat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Our Mission
            </h2>
            <p className="text-2xl text-gray-700 leading-relaxed mb-12">
              To make India's Constitution accessible, engaging, and understandable for every citizen through innovative
              technology and immersive learning experiences.
            </p>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 text-left">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-orange-600">🎯 Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  Creating a digitally empowered India where every citizen understands their constitutional rights,
                  duties, and the democratic framework that governs our nation.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-green-600">💡 Our Innovation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Combining cutting-edge 3D technology, artificial intelligence, and gamification to transform
                  constitutional education from boring text to engaging interactive experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-orange-50 to-green-50">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Ready to Master the Constitution?
            </h2>
            <p className="text-xl text-gray-700 mb-12">
              Join thousands of learners and start your constitutional journey today with our revolutionary 3D learning
              platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                🚀 Start Free Trial
              </Button>
              <Button
                variant="outline"
                className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold text-lg px-12 py-4 rounded-xl transition-all duration-300"
              >
                📞 Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-xl flex items-center justify-center border-2 border-orange-200">
                  <BookOpen className="w-8 h-8 text-orange-700" />
                </div>
                <div>
                  <span className="text-3xl font-black bg-gradient-to-r from-orange-400 to-green-400 bg-clip-text text-transparent">
                    VidhikGuru
                  </span>
                  <div className="text-sm text-gray-400">Constitutional Learning Platform</div>
                </div>
              </div>
              <p className="text-gray-400 max-w-md text-lg leading-relaxed mb-6">
                India's most advanced constitutional learning platform with revolutionary 3D technology, AI assistance,
                and gamified experiences.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-8 text-xl text-orange-400">Features</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="hover:text-orange-400 transition-colors cursor-pointer">3D Interactive Book</li>
                <li className="hover:text-orange-400 transition-colors cursor-pointer">AI Constitutional Assistant</li>
                <li className="hover:text-orange-400 transition-colors cursor-pointer">Gamified Learning</li>
                <li className="hover:text-orange-400 transition-colors cursor-pointer">Progress Tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-8 text-xl text-green-400">Support</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="hover:text-green-400 transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Live Chat Support</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Video Tutorials</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Community Forum</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-16 pt-12 text-center">
            <p className="text-gray-400 text-lg">
              &copy; 2025 <span className="text-orange-400 font-semibold">VidhikGuru</span>. All rights reserved. Made
              with ❤️ for India 🇮🇳
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Empowering citizens through constitutional knowledge since 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
