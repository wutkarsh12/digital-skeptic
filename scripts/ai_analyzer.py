import json
import sys
import re
from collections import Counter
import math

class DigitalSkepticAnalyzer:
    def __init__(self):
        # Bias indicators
        self.emotional_words = [
            'shocking', 'outrageous', 'devastating', 'incredible', 'unbelievable',
            'amazing', 'terrible', 'horrible', 'fantastic', 'extraordinary',
            'alarming', 'disturbing', 'sensational', 'explosive', 'dramatic'
        ]
        
        self.hedging_words = [
            'might', 'could', 'possibly', 'perhaps', 'allegedly', 'reportedly',
            'supposedly', 'apparently', 'seemingly', 'presumably', 'likely',
            'probably', 'potentially', 'may', 'suggests', 'indicates'
        ]
        
        self.absolute_words = [
            'always', 'never', 'all', 'none', 'every', 'completely', 'totally',
            'absolutely', 'definitely', 'certainly', 'undoubtedly', 'obviously',
            'clearly', 'without question', 'beyond doubt'
        ]
        
        self.source_indicators = [
            'according to', 'sources say', 'reports indicate', 'studies show',
            'experts believe', 'research suggests', 'data reveals', 'analysis shows'
        ]
    
    def analyze_article(self, article_data):
        """Perform comprehensive analysis of the article"""
        content = article_data.get('content', '')
        title = article_data.get('title', '')
        
        # Core analysis components
        core_claims = self._extract_core_claims(content)
        language_analysis = self._analyze_language(content, title)
        red_flags = self._identify_red_flags(content, title, article_data)
        verification_questions = self._generate_verification_questions(core_claims, article_data)
        credibility_score = self._calculate_credibility_score(language_analysis, red_flags, article_data)
        
        return {
            'credibilityScore': credibility_score,
            'coreClaims': core_claims,
            'languageAnalysis': language_analysis,
            'redFlags': red_flags,
            'verificationQuestions': verification_questions,
            'strengths': self._identify_strengths(content, article_data),
            'weaknesses': self._identify_weaknesses(red_flags, language_analysis)
        }
    
    def _extract_core_claims(self, content):
        """Extract 3-5 main factual claims from the article"""
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        # Score sentences based on factual indicators
        scored_sentences = []
        for sentence in sentences[:50]:  # Limit to first 50 sentences
            score = 0
            
            # Boost score for numbers, dates, specific names
            if re.search(r'\b\d+\b', sentence):
                score += 2
            if re.search(r'\b(19|20)\d{2}\b', sentence):
                score += 1
            if re.search(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', sentence):
                score += 1
            
            # Reduce score for opinion indicators
            opinion_words = ['believe', 'think', 'feel', 'opinion', 'view']
            for word in opinion_words:
                if word in sentence.lower():
                    score -= 1
            
            scored_sentences.append((sentence, score))
        
        # Select top claims
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        claims = [sentence for sentence, score in scored_sentences[:5] if score > 0]
        
        return claims[:4] if len(claims) > 4 else claims
    
    def _analyze_language(self, content, title):
        """Analyze language patterns and tone"""
        words = re.findall(r'\b\w+\b', content.lower())
        total_words = len(words)
        
        # Count different types of language
        emotional_count = sum(1 for word in words if word in self.emotional_words)
        hedging_count = sum(1 for word in words if word in self.hedging_words)
        absolute_count = sum(1 for word in words if word in self.absolute_words)
        
        # Calculate percentages
        emotional_percentage = (emotional_count / total_words) * 100 if total_words > 0 else 0
        hedging_percentage = (hedging_count / total_words) * 100 if total_words > 0 else 0
        absolute_percentage = (absolute_count / total_words) * 100 if total_words > 0 else 0
        
        # Determine tone
        tone = "neutral"
        if emotional_percentage > 0.5:
            tone = "highly emotional"
        elif emotional_percentage > 0.2:
            tone = "moderately emotional"
        elif hedging_percentage > 1.0:
            tone = "cautious/hedged"
        elif absolute_percentage > 0.3:
            tone = "assertive"
        
        return {
            'tone': tone,
            'emotionalLanguage': {
                'percentage': round(emotional_percentage, 2),
                'examples': [word for word in set(words) if word in self.emotional_words][:5]
            },
            'hedgingLanguage': {
                'percentage': round(hedging_percentage, 2),
                'examples': [word for word in set(words) if word in self.hedging_words][:5]
            },
            'absoluteStatements': {
                'percentage': round(absolute_percentage, 2),
                'examples': [word for word in set(words) if word in self.absolute_words][:5]
            }
        }
    
    def _identify_red_flags(self, content, title, article_data):
        """Identify potential red flags in the article"""
        red_flags = []
        
        # Check for missing author
        if not article_data.get('author') or article_data.get('author') == 'Unknown Author':
            red_flags.append({
                'type': 'Missing Attribution',
                'description': 'No clear author attribution found',
                'severity': 'medium'
            })
        
        # Check for missing date
        if not article_data.get('publishDate'):
            red_flags.append({
                'type': 'Missing Date',
                'description': 'No publication date found',
                'severity': 'medium'
            })
        
        # Check for sensational headline
        title_words = title.lower().split()
        sensational_in_title = any(word in title_words for word in self.emotional_words)
        if sensational_in_title:
            red_flags.append({
                'type': 'Sensational Headline',
                'description': 'Headline contains emotionally charged language',
                'severity': 'low'
            })
        
        # Check for lack of sources
        source_mentions = sum(1 for indicator in self.source_indicators 
                            if indicator in content.lower())
        if source_mentions < 2 and len(content) > 1000:
            red_flags.append({
                'type': 'Limited Source Attribution',
                'description': 'Few or no sources cited in the article',
                'severity': 'high'
            })
        
        # Check for excessive emotional language
        words = re.findall(r'\b\w+\b', content.lower())
        emotional_ratio = sum(1 for word in words if word in self.emotional_words) / len(words)
        if emotional_ratio > 0.01:  # More than 1% emotional words
            red_flags.append({
                'type': 'Excessive Emotional Language',
                'description': f'High use of emotional language ({emotional_ratio:.1%})',
                'severity': 'medium'
            })
        
        return red_flags
    
    def _generate_verification_questions(self, claims, article_data):
        """Generate specific questions for fact-checking"""
        questions = []
        
        # Generic verification questions
        questions.append("What are the primary sources for the main claims in this article?")
        questions.append("Can the key statistics or data points be verified through independent sources?")
        
        # Claim-specific questions
        for i, claim in enumerate(claims[:2]):
            if re.search(r'\b\d+\b', claim):
                questions.append(f"Can the numerical claims in '{claim[:50]}...' be verified?")
            elif re.search(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', claim):
                questions.append(f"What is the credibility of the people or organizations mentioned?")
        
        # Domain-specific questions
        domain = article_data.get('domain', '')
        if domain:
            questions.append(f"What is the editorial stance and funding of {domain}?")
        
        return questions[:4]
    
    def _calculate_credibility_score(self, language_analysis, red_flags, article_data):
        """Calculate overall credibility score (0-100)"""
        score = 70  # Start with neutral score
        
        # Deduct for red flags
        for flag in red_flags:
            if flag['severity'] == 'high':
                score -= 15
            elif flag['severity'] == 'medium':
                score -= 8
            else:
                score -= 3
        
        # Deduct for excessive emotional language
        emotional_pct = language_analysis['emotionalLanguage']['percentage']
        if emotional_pct > 1.0:
            score -= min(20, emotional_pct * 2)
        
        # Add points for good practices
        if article_data.get('author') and article_data.get('author') != 'Unknown Author':
            score += 5
        if article_data.get('publishDate'):
            score += 5
        
        # Ensure score is within bounds
        return max(0, min(100, int(score)))
    
    def _identify_strengths(self, content, article_data):
        """Identify positive aspects of the article"""
        strengths = []
        
        if article_data.get('author') and article_data.get('author') != 'Unknown Author':
            strengths.append("Clear author attribution")
        
        if article_data.get('publishDate'):
            strengths.append("Publication date provided")
        
        # Check for source attribution
        source_count = sum(1 for indicator in self.source_indicators 
                          if indicator in content.lower())
        if source_count >= 3:
            strengths.append("Multiple sources referenced")
        
        # Check for balanced language
        words = re.findall(r'\b\w+\b', content.lower())
        hedging_ratio = sum(1 for word in words if word in self.hedging_words) / len(words)
        if hedging_ratio > 0.005:  # More than 0.5% hedging words
            strengths.append("Appropriately cautious language used")
        
        return strengths
    
    def _identify_weaknesses(self, red_flags, language_analysis):
        """Identify areas for improvement"""
        weaknesses = []
        
        for flag in red_flags:
            weaknesses.append(flag['description'])
        
        # Add language-based weaknesses
        if language_analysis['emotionalLanguage']['percentage'] > 0.5:
            weaknesses.append("Heavy use of emotional language may indicate bias")
        
        if language_analysis['absoluteStatements']['percentage'] > 0.3:
            weaknesses.append("Frequent absolute statements without qualification")
        
        return weaknesses

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'success': False, 'error': 'Article data required'}))
        sys.exit(1)
    
    try:
        article_data = json.loads(sys.argv[1])
        analyzer = DigitalSkepticAnalyzer()
        analysis = analyzer.analyze_article(article_data)
        print(json.dumps({'success': True, 'analysis': analysis}))
    except json.JSONDecodeError:
        print(json.dumps({'success': False, 'error': 'Invalid JSON input'}))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == "__main__":
    main()
