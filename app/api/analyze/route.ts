import { type NextRequest, NextResponse } from "next/server"

interface AnalysisResult {
  coreClaims: string[]
  languageAnalysis: {
    tone: string
    objectivity: string
    emotionalLanguage: string[]
    hedgingLanguage: string[]
  }
  redFlags: string[]
  verificationQuestions: string[]
  overallAssessment: {
    credibilityScore: number
    biasIndicators: string[]
    strengthsWeaknesses: {
      strengths: string[]
      weaknesses: string[]
    }
  }
}

// Mock AI analysis engine - simulates sophisticated analysis
function analyzeArticle(content: string, title: string, url: string): AnalysisResult {
  const words = content.toLowerCase().split(/\s+/)
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10)

  // Detect emotional/loaded language
  const emotionalWords = [
    "shocking",
    "devastating",
    "incredible",
    "amazing",
    "terrible",
    "outrageous",
    "unbelievable",
    "stunning",
  ]
  const foundEmotional = emotionalWords.filter((word) => content.toLowerCase().includes(word))

  // Detect hedging language
  const hedgingWords = ["allegedly", "reportedly", "sources say", "it appears", "seems to", "might", "could be"]
  const foundHedging = hedgingWords.filter((phrase) => content.toLowerCase().includes(phrase))

  // Extract potential claims (sentences with strong assertions)
  const claimIndicators = ["is", "are", "will", "has", "have", "shows", "proves", "demonstrates"]
  const potentialClaims = sentences
    .filter((s) => claimIndicators.some((indicator) => s.toLowerCase().includes(indicator)))
    .slice(0, 5)
    .map((s) => s.trim())

  // Generate analysis based on content patterns
  const hasQuotes = content.includes('"') || content.includes("'")
  const hasNumbers = /\d+/.test(content)
  const hasSourceAttribution =
    content.toLowerCase().includes("according to") || content.toLowerCase().includes("source")

  // Determine tone
  let tone = "neutral"
  if (foundEmotional.length > 2) tone = "emotional"
  else if (foundHedging.length > 1) tone = "cautious"
  else if (hasNumbers && hasSourceAttribution) tone = "analytical"

  // Calculate credibility score
  let credibilityScore = 50
  if (hasQuotes) credibilityScore += 15
  if (hasNumbers) credibilityScore += 10
  if (hasSourceAttribution) credibilityScore += 20
  if (foundEmotional.length > 3) credibilityScore -= 20
  if (sentences.length < 10) credibilityScore -= 15
  credibilityScore = Math.max(0, Math.min(100, credibilityScore))

  // Generate red flags
  const redFlags = []
  if (foundEmotional.length > 3) redFlags.push("Heavy use of emotional language may indicate bias")
  if (!hasSourceAttribution) redFlags.push("Limited source attribution - claims not well-supported")
  if (sentences.length < 10) redFlags.push("Article appears unusually short for the topic")
  if (title.includes("!") || title.toUpperCase() === title) redFlags.push("Sensationalized headline")
  if (!hasNumbers && content.length > 1000) redFlags.push("Lacks specific data or statistics")

  return {
    coreClaims: potentialClaims.slice(0, 4),
    languageAnalysis: {
      tone,
      objectivity: credibilityScore > 70 ? "High" : credibilityScore > 40 ? "Moderate" : "Low",
      emotionalLanguage: foundEmotional,
      hedgingLanguage: foundHedging,
    },
    redFlags,
    verificationQuestions: [
      "What are the primary sources for the main claims in this article?",
      "Are there any conflicting reports or alternative perspectives on this topic?",
      "What evidence supports the key assertions made?",
      "Who benefits from this particular framing of the story?",
    ],
    overallAssessment: {
      credibilityScore,
      biasIndicators: foundEmotional.length > 2 ? ["Emotional language", "Potential sensationalism"] : [],
      strengthsWeaknesses: {
        strengths: [
          ...(hasQuotes ? ["Includes direct quotes"] : []),
          ...(hasNumbers ? ["Contains specific data"] : []),
          ...(hasSourceAttribution ? ["Cites sources"] : []),
        ],
        weaknesses: [
          ...(foundEmotional.length > 2 ? ["Uses emotional language"] : []),
          ...(!hasSourceAttribution ? ["Limited source attribution"] : []),
          ...(sentences.length < 10 ? ["Very brief coverage"] : []),
        ],
      },
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, title, url } = await request.json()

    if (!content || !title) {
      return NextResponse.json({ error: "Content and title are required" }, { status: 400 })
    }

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const analysis = analyzeArticle(content, title, url)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze article" }, { status: 500 })
  }
}
