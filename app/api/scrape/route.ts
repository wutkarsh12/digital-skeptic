import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log("[v0] Starting to scrape URL:", url)

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract article information
    const title =
      $("title").text().trim() ||
      $("h1").first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      "Untitled Article"

    const author =
      $('meta[name="author"]').attr("content") ||
      $('meta[property="article:author"]').attr("content") ||
      $(".author").first().text().trim() ||
      $('[rel="author"]').first().text().trim()

    const publishDate =
      $('meta[property="article:published_time"]').attr("content") ||
      $('meta[name="date"]').attr("content") ||
      $("time").attr("datetime") ||
      $(".date").first().text().trim()

    // Extract main content
    let content = ""
    const contentSelectors = ["article", ".article-content", ".post-content", ".entry-content", "main", ".content", "p"]

    for (const selector of contentSelectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        content = elements
          .map((_, el) => $(el).text())
          .get()
          .join(" ")
          .trim()
        if (content.length > 100) break
      }
    }

    if (!content) {
      content = $("body").text().replace(/\s+/g, " ").trim()
    }

    console.log("[v0] Scraping successful, title:", title)

    const aiAnalysis = generateAnalysis(content, title, url)

    console.log("[v0] Analysis complete, credibility score:", aiAnalysis.overallAssessment.credibilityScore)

    return NextResponse.json({
      title,
      url,
      author: author || undefined,
      publishDate: publishDate || undefined,
      content: content.substring(0, 2000), // Limit content length
      aiAnalysis, // Return aiAnalysis object with correct structure
    })
  } catch (error) {
    console.error("[v0] Scraping error:", error)
    return NextResponse.json({ error: "Failed to scrape article" }, { status: 500 })
  }
}

function generateAnalysis(content: string, title: string, url: string) {
  const words = content.toLowerCase().split(/\s+/)
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  // Analyze emotional language
  const emotionalWords = [
    "amazing",
    "terrible",
    "shocking",
    "incredible",
    "devastating",
    "outrageous",
    "fantastic",
    "horrible",
  ]
  const foundEmotionalWords = words.filter((word) => emotionalWords.some((emo) => word.includes(emo)))

  // Analyze hedging language
  const hedgingPhrases = ["might", "could", "possibly", "perhaps", "allegedly", "reportedly", "seems to", "appears to"]
  const foundHedging = hedgingPhrases.filter((phrase) => content.toLowerCase().includes(phrase))

  // Generate core claims (first few meaningful sentences)
  const coreClaims = sentences
    .filter((s) => s.trim().length > 20)
    .slice(0, 4)
    .map((s) => s.trim())

  // Determine tone
  const hasEmotionalLanguage = foundEmotionalWords.length > 0
  const hasHedging = foundHedging.length > 0
  let tone = "neutral"
  if (hasEmotionalLanguage && !hasHedging) tone = "emotional"
  else if (hasHedging && !hasEmotionalLanguage) tone = "cautious"
  else if (hasEmotionalLanguage && hasHedging) tone = "mixed"

  // Determine objectivity
  let objectivity = "moderate"
  if (foundEmotionalWords.length === 0 && foundHedging.length > 2) objectivity = "high"
  else if (foundEmotionalWords.length > 3) objectivity = "low"

  // Generate red flags
  const redFlags = []
  if (foundEmotionalWords.length > 3) redFlags.push("Excessive use of emotional language")
  if (sentences.length < 5) redFlags.push("Very short article with limited information")
  if (!content.includes("source") && !content.includes("study") && !content.includes("research")) {
    redFlags.push("Lack of cited sources or references")
  }
  if (title.includes("!") || title.includes("BREAKING")) redFlags.push("Sensationalized headline")

  // Calculate credibility score
  let credibilityScore = 70 // Base score
  credibilityScore -= foundEmotionalWords.length * 5
  credibilityScore += foundHedging.length * 3
  credibilityScore -= redFlags.length * 10
  credibilityScore = Math.max(0, Math.min(100, credibilityScore))

  // Generate verification questions
  const verificationQuestions = [
    "What are the primary sources cited in this article?",
    "Can the main claims be verified through independent sources?",
    "What is the author's expertise and potential bias on this topic?",
    "Are there any conflicting reports or alternative perspectives mentioned?",
  ]

  // Generate strengths and weaknesses
  const strengths = []
  const weaknesses = []

  if (foundHedging.length > 0) strengths.push("Uses qualifying language showing appropriate caution")
  if (content.length > 500) strengths.push("Provides substantial detail and context")
  if (sentences.length > 10) strengths.push("Comprehensive coverage of the topic")

  if (foundEmotionalWords.length > 2) weaknesses.push("Contains emotionally charged language")
  if (redFlags.length > 0) weaknesses.push("Multiple red flags identified in content and presentation")
  if (content.length < 300) weaknesses.push("Limited depth and detail in reporting")

  // Generate bias indicators
  const biasIndicators = []
  if (foundEmotionalWords.length > 2) biasIndicators.push("Emotional Language")
  if (title.includes("!")) biasIndicators.push("Sensational Headlines")
  if (redFlags.length > 2) biasIndicators.push("Multiple Red Flags")

  return {
    coreClaims,
    languageAnalysis: {
      tone,
      objectivity,
      emotionalLanguage: foundEmotionalWords.slice(0, 5),
      hedgingLanguage: foundHedging.slice(0, 5),
    },
    redFlags,
    verificationQuestions,
    overallAssessment: {
      credibilityScore,
      biasIndicators,
      strengthsWeaknesses: {
        strengths,
        weaknesses,
      },
    },
  }
}
