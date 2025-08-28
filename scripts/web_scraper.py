import requests
from bs4 import BeautifulSoup
import json
import sys
from urllib.parse import urljoin, urlparse
import time
import re

class WebScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def scrape_article(self, url):
        """Scrape article content from a given URL"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract metadata
            title = self._extract_title(soup)
            author = self._extract_author(soup)
            publish_date = self._extract_publish_date(soup)
            
            # Extract main content
            content = self._extract_content(soup)
            
            # Calculate reading time
            word_count = len(content.split())
            reading_time = max(1, word_count // 200)  # Average reading speed
            
            return {
                'success': True,
                'url': url,
                'title': title,
                'author': author,
                'publishDate': publish_date,
                'content': content,
                'wordCount': word_count,
                'readingTime': reading_time,
                'domain': urlparse(url).netloc
            }
            
        except requests.RequestException as e:
            return {
                'success': False,
                'error': f'Network error: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Parsing error: {str(e)}'
            }
    
    def _extract_title(self, soup):
        """Extract article title"""
        # Try multiple selectors
        selectors = [
            'h1',
            '[data-testid="headline"]',
            '.headline',
            '.article-title',
            'title'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element and element.get_text().strip():
                return element.get_text().strip()
        
        return "Unknown Title"
    
    def _extract_author(self, soup):
        """Extract article author"""
        selectors = [
            '[rel="author"]',
            '.author',
            '.byline',
            '[data-testid="author"]',
            '.article-author'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element and element.get_text().strip():
                return element.get_text().strip()
        
        return "Unknown Author"
    
    def _extract_publish_date(self, soup):
        """Extract publish date"""
        selectors = [
            'time[datetime]',
            '[data-testid="timestamp"]',
            '.publish-date',
            '.article-date'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if element.get('datetime'):
                    return element.get('datetime')
                elif element.get_text().strip():
                    return element.get_text().strip()
        
        return None
    
    def _extract_content(self, soup):
        """Extract main article content"""
        # Remove unwanted elements
        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'advertisement']):
            element.decompose()
        
        # Try multiple content selectors
        content_selectors = [
            'article',
            '.article-content',
            '.post-content',
            '.entry-content',
            '[data-testid="article-body"]',
            '.story-body',
            'main'
        ]
        
        for selector in content_selectors:
            content_element = soup.select_one(selector)
            if content_element:
                paragraphs = content_element.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                if paragraphs:
                    content = '\n\n'.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
                    if len(content) > 200:  # Ensure we have substantial content
                        return content
        
        # Fallback: extract all paragraphs
        paragraphs = soup.find_all('p')
        content = '\n\n'.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
        
        return content if content else "Could not extract article content"

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'success': False, 'error': 'URL parameter required'}))
        sys.exit(1)
    
    url = sys.argv[1]
    scraper = WebScraper()
    result = scraper.scrape_article(url)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
