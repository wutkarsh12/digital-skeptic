# Digital Skeptic AI Tool

A web-based application that helps users critically analyze news articles and online content for bias, credibility, and journalistic quality. The tool scrapes article content from URLs and provides comprehensive analysis including credibility scoring, language analysis, and verification questions.


## Screenshots

**Home Page – Analyze News Article**
[Screenshot 1](images/Screenshot1.png)

**Critical Analysis Report**
[Screenshot 2](images/Screenshot2.png)

**Red Flags & Verification Questions**
[Screenshot 3](images/Screenshot3.png)

## Features

- **Article Scraping**: Automatically extracts content from news article URLs
- **Credibility Analysis**: Provides credibility scores and bias indicators
- **Language Analysis**: Evaluates tone, objectivity, and identifies emotional/hedging language
- **Red Flag Detection**: Identifies potential signs of poor journalism or bias
- **Verification Questions**: Generates specific questions for fact-checking
- **Export Options**: Export analysis reports in Markdown, JSON, or plain text formats
- **Sharing**: Share analysis results via email, social media, or direct links

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Web Scraping**: Cheerio for HTML parsing
- **Analysis Engine**: Custom TypeScript implementation

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/skeptical-analysis-tool.git
cd skeptical-analysis-tool
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Enter Article URL**: Paste the URL of a news article you want to analyze
2. **Click Analyze**: The tool will scrape the article content and perform analysis
3. **Review Results**: Examine the credibility score, language analysis, and red flags
4. **Export or Share**: Use the built-in export and sharing features to save or distribute the analysis

## Analysis Components

### Credibility Score
- Numerical score (0-100) indicating overall article credibility
- Based on multiple factors including source quality, language patterns, and content structure

### Language Analysis
- **Tone**: Assessment of the article's overall tone (neutral, positive, negative)
- **Objectivity**: Evaluation of balanced vs. biased language
- **Emotional Language**: Identification of emotionally charged words
- **Hedging Language**: Detection of uncertainty indicators

### Red Flags
- Potential indicators of bias or poor journalism
- Missing attribution, sensational headlines, unsupported claims
- Logical fallacies and misleading statistics

### Verification Questions
- Specific questions to guide fact-checking efforts
- Targeted inquiries about claims, sources, and methodology

## API Endpoints

### POST /api/scrape
Scrapes and analyzes an article from a given URL.

**Request Body:**
\`\`\`json
{
  "url": "https://example.com/article"
}
\`\`\`

**Response:**
\`\`\`json
{
  "title": "Article Title",
  "url": "https://example.com/article",
  "author": "Author Name",
  "publishDate": "2024-01-01",
  "content": "Article content...",
  "aiAnalysis": {
    "coreClaims": ["Claim 1", "Claim 2"],
    "languageAnalysis": {
      "tone": "neutral",
      "objectivity": "balanced",
      "emotionalLanguage": ["exciting", "alarming"],
      "hedgingLanguage": ["might", "could"]
    },
    "redFlags": ["Missing source attribution"],
    "verificationQuestions": ["Question 1", "Question 2"],
    "overallAssessment": {
      "credibilityScore": 75,
      "biasIndicators": ["Indicator 1"],
      "strengthsWeaknesses": {
        "strengths": ["Well-sourced"],
        "weaknesses": ["Limited perspective"]
      }
    }
  }
}
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

### Project Structure
\`\`\`
├── app/
│   ├── api/
│   │   └── scrape/
│   │       └── route.ts      # Main API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page component
├── components/
│   ├── analysis-report.tsx  # Analysis display component
│   └── ui/                  # UI components
└── scripts/                 # Utility scripts
\`\`\`

### Adding New Analysis Features

1. Update the analysis logic in `app/api/scrape/route.ts`
2. Modify the `AnalysisReport` component to display new data
3. Update TypeScript interfaces for type safety

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies for optimal performance
- Designed with accessibility and user experience in mind
- Inspired by the need for critical media literacy in the digital age
