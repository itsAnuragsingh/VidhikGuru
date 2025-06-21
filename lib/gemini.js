import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * @typedef {Object} GeneratedQuestion
 * @property {string} question
 * @property {string[]} options
 * @property {number} correctAnswer
 * @property {string} explanation
 * @property {"easy" | "medium" | "hard"} difficulty
 */

/**
 * @typedef {Object} QuizGenerationParams
 * @property {string} topic
 * @property {"Beginner" | "Intermediate" | "Advanced"} difficulty
 * @property {number} questionCount
 * @property {string} category
 */

/**
 * @param {QuizGenerationParams} params
 * @returns {Promise<GeneratedQuestion[]>}
 */
export async function generateQuizQuestions(params) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const prompt = `
Generate ${params.questionCount} multiple choice questions about "${params.topic}" in the category "${params.category}".
Requirements:
- Difficulty level: ${params.difficulty}
- Each question should have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Include a detailed explanation for each correct answer
- Questions should be educational and factually accurate
- Focus on Indian Constitutional Law if the category is related to constitution
Format the response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct",
    "difficulty": "easy|medium|hard"
  }
]
Make sure the JSON is valid and properly formatted. The correctAnswer should be the index (0-3) of the correct option in the options array.
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    const questions = JSON.parse(jsonMatch[0])

    // Validate the structure
    questions.forEach((q, index) => {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3 ||
        !q.explanation
      ) {
        throw new Error(`Invalid question structure at index ${index}`)
      }
    })

    return questions
  } catch (error) {
    console.error("Error generating quiz questions:", error)
    throw new Error("Failed to generate quiz questions")
  }
}

/**
 * @param {string} topic
 * @param {string} category
 * @returns {Promise<{ title: string; description: string }>}
 */
export async function generateQuizMetadata(
  topic,
  category,
) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const prompt = `
Generate a title and description for a quiz about "${topic}" in the category "${category}".
Requirements:
- Title should be concise and engaging (max 50 characters)
- Description should be informative and motivating (max 150 characters)
- Focus on learning outcomes
Format as JSON:
{
  "title": "Quiz title here",
  "description": "Quiz description here"
}
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error generating quiz metadata:", error)
    return {
      title: `${topic} Quiz`,
      description: `Test your knowledge about ${topic}`,
    }
  }
}