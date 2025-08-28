"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, AlertTriangle } from "lucide-react"
import { AnalysisReport } from "@/components/analysis-report"

export default function DigitalSkepticPage() {
  const [url, setUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!url.trim()) return

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      console.log("[v0] Starting analysis for URL:", url)

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to scrape article"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      let data
      try {
        data = await response.json()
      } catch {
        throw new Error("Invalid response format from server")
      }

      console.log("[v0] Successfully scraped article:", data.title)

      if (data.aiAnalysis) {
        setAnalysis({
          title: data.title,
          url: data.url,
          author: data.author,
          publishDate: data.publishDate,
          content: data.content,
          aiAnalysis: data.aiAnalysis, // Fixed: was data.analysis, now data.aiAnalysis
        })
      } else {
        // Fallback to mock data if analysis failed
        setAnalysis({
          title: data.title,
          url: data.url,
          author: data.author,
          publishDate: data.publishDate,
          content: data.content,
          aiAnalysis: {
            coreClaims: ["Analysis temporarily unavailable"],
            languageAnalysis: {
              tone: "neutral",
              objectivity: "Moderate",
              emotionalLanguage: [],
              hedgingLanguage: [],
            },
            redFlags: ["AI analysis could not be completed"],
            verificationQuestions: ["Please try again later"],
            overallAssessment: {
              credibilityScore: 50,
              biasIndicators: [],
              strengthsWeaknesses: { strengths: [], weaknesses: [] },
            },
          },
        })
      }
    } catch (err) {
      console.error("[v0] Analysis error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Digital Skeptic</h1>
                <p className="text-sm text-muted-foreground">Empowering Critical Thinking</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Analyze News Article
            </CardTitle>
            <CardDescription>
              Enter the URL of a news article to perform a critical analysis for bias, claims, and verification
              questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/news-article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isAnalyzing}
              />
              <Button onClick={handleAnalyze} disabled={!url.trim() || isAnalyzing} className="px-6">
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported: Most news websites and blog articles. Analysis typically takes 30-60 seconds.
            </p>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <AnalysisReport
            analysis={analysis}
            onExport={() => console.log("[v0] Report exported")}
            onShare={() => console.log("[v0] Report shared")}
          />
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Analysis Failed</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
              <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={() => setError(null)}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!analysis && !isAnalyzing && !error && (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to Analyze</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Paste a news article URL above to get started with critical analysis. Our AI will help you identify
                claims, detect bias, and formulate verification questions.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
