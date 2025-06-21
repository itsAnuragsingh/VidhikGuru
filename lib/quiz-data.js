export const fallbackQuizzes = [
    {
      _id: "fallback_1",
      title: "Fundamental Rights Basics",
      description: "Test your knowledge of Articles 12-35",
      category: "Constitutional Law",
      difficulty: "Beginner",
      timeLimit: 15,
      questions: [
        {
          question: "Which article defines the Right to Equality?",
          options: ["Article 12", "Article 14", "Article 16", "Article 18"],
          correctAnswer: 1,
          explanation: "Article 14 guarantees equality before law and equal protection of laws.",
        },
        {
          question: "The Right to Freedom of Speech and Expression is guaranteed under which article?",
          options: ["Article 19", "Article 20", "Article 21", "Article 22"],
          correctAnswer: 0,
          explanation: "Article 19(1)(a) guarantees the right to freedom of speech and expression.",
        },
        {
          question: "Which article prohibits discrimination on grounds of religion, race, caste, sex or place of birth?",
          options: ["Article 14", "Article 15", "Article 16", "Article 17"],
          correctAnswer: 1,
          explanation: "Article 15 prohibits discrimination on grounds of religion, race, caste, sex or place of birth.",
        },
        {
          question: "The Right to Life and Personal Liberty is enshrined in which article?",
          options: ["Article 20", "Article 21", "Article 22", "Article 23"],
          correctAnswer: 1,
          explanation: "Article 21 guarantees the right to life and personal liberty.",
        },
        {
          question: "Which article deals with the Right against Exploitation?",
          options: ["Article 23", "Article 24", "Article 25", "Both A and B"],
          correctAnswer: 3,
          explanation: "Articles 23 and 24 both deal with the Right against Exploitation.",
        },
      ],
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
      isStatic: true,
    },
    {
      _id: "fallback_2",
      title: "Directive Principles Overview",
      description: "Articles 36-51 and state policy guidelines",
      category: "Constitutional Law",
      difficulty: "Intermediate",
      timeLimit: 12,
      questions: [
        {
          question: "Directive Principles of State Policy are contained in which part of the Constitution?",
          options: ["Part III", "Part IV", "Part V", "Part VI"],
          correctAnswer: 1,
          explanation: "Part IV of the Constitution contains the Directive Principles of State Policy.",
        },
        {
          question:
            "Which article directs the state to secure a social order for the promotion of welfare of the people?",
          options: ["Article 36", "Article 37", "Article 38", "Article 39"],
          correctAnswer: 2,
          explanation: "Article 38 directs the state to secure a social order for the promotion of welfare.",
        },
        {
          question: "The concept of Directive Principles was borrowed from which country's constitution?",
          options: ["USA", "UK", "Ireland", "Canada"],
          correctAnswer: 2,
          explanation: "The concept of Directive Principles was borrowed from the Irish Constitution.",
        },
        {
          question: "Which article provides for free and compulsory education for children?",
          options: ["Article 45", "Article 46", "Article 47", "Article 48"],
          correctAnswer: 0,
          explanation: "Article 45 (now Article 21A) provides for free and compulsory education.",
        },
      ],
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
      isStatic: true,
    },
    {
      _id: "fallback_3",
      title: "Constitutional Amendments",
      description: "Major amendments and their impact",
      category: "Constitutional Law",
      difficulty: "Advanced",
      timeLimit: 20,
      questions: [
        {
          question: "Which amendment is known as the 'Mini Constitution'?",
          options: ["42nd Amendment", "44th Amendment", "52nd Amendment", "73rd Amendment"],
          correctAnswer: 0,
          explanation: "The 42nd Amendment (1976) is known as the 'Mini Constitution' due to its extensive changes.",
        },
        {
          question: "The Right to Education was added by which constitutional amendment?",
          options: ["85th Amendment", "86th Amendment", "87th Amendment", "88th Amendment"],
          correctAnswer: 1,
          explanation: "The 86th Amendment (2002) added the Right to Education as Article 21A.",
        },
        {
          question: "Which amendment reduced the voting age from 21 to 18 years?",
          options: ["59th Amendment", "60th Amendment", "61st Amendment", "62nd Amendment"],
          correctAnswer: 2,
          explanation: "The 61st Amendment (1988) reduced the voting age from 21 to 18 years.",
        },
      ],
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
      isStatic: true,
    },
  ]

  // Helper function to get quiz by category
  export const getQuizzesByCategory = (category) => {
    return fallbackQuizzes.filter((quiz) => quiz.category === category)
  }

  // Helper function to get quiz by difficulty
  export const getQuizzesByDifficulty = (difficulty) => {
    return fallbackQuizzes.filter((quiz) => quiz.difficulty === difficulty)
  }

  // Helper function to get random quiz
  export const getRandomQuiz = () => {
    const randomIndex = Math.floor(Math.random() * fallbackQuizzes.length)
    return fallbackQuizzes[randomIndex]
  }