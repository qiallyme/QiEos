#!/usr/bin/env python3
"""
Demo KB Crawler - Works with publicly accessible sites
Demonstrates the full functionality with real content extraction
"""

import json
import re
import requests
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import time

class DemoKBCrawler:
    def __init__(self, base_url: str, max_pages: int = 3, max_chars_per_page: int = 15000):
        self.base_url = base_url
        self.max_pages = max_pages
        self.max_chars_per_page = max_chars_per_page
        self.crawled_pages = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'KB-Crawler-Demo/1.0 (Educational Purpose)'
        })
        
    def create_slug(self, url: str, title: str = "") -> str:
        """Create a URL-safe slug from URL and title"""
        parsed = urlparse(url)
        path = parsed.path.strip('/')
        
        if path:
            slug = re.sub(r'[^a-zA-Z0-9\-_]', '-', path)
        else:
            slug = re.sub(r'[^a-zA-Z0-9\-_]', '-', title.lower())
        
        slug = re.sub(r'-+', '-', slug).strip('-')
        return slug or 'index'
    
    def extract_content(self, html: str, url: str) -> Dict:
        """Extract title, h1s, and main content from HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Extract title
        title = ""
        if soup.title:
            title = soup.title.get_text().strip()
        
        # Extract h1 headings
        h1s = [h1.get_text().strip() for h1 in soup.find_all('h1')]
        
        # Extract main content with multiple strategies
        main_content = ""
        
        # Strategy 1: Look for semantic HTML5 elements
        semantic_selectors = [
            'main', 'article', '[role="main"]', 
            '.content', '.main-content', '.page-content',
            '#content', '#main', '.post-content', '.entry-content'
        ]
        
        for selector in semantic_selectors:
            content_elem = soup.select_one(selector)
            if content_elem:
                main_content = content_elem.get_text(separator=' ', strip=True)
                break
        
        # Strategy 2: Look for common content patterns
        if not main_content:
            content_patterns = [
                soup.find('div', class_=re.compile(r'content|main|body|text')),
                soup.find('section'),
                soup.find('div', id=re.compile(r'content|main|body'))
            ]
            
            for elem in content_patterns:
                if elem:
                    main_content = elem.get_text(separator=' ', strip=True)
                    if len(main_content) > 100:  # Ensure substantial content
                        break
        
        # Strategy 3: Fallback to body
        if not main_content or len(main_content) < 50:
            body = soup.find('body')
            if body:
                main_content = body.get_text(separator=' ', strip=True)
        
        # Clean up content
        main_content = re.sub(r'\s+', ' ', main_content).strip()
        
        return {
            'title': title,
            'h1s': h1s,
            'content': main_content[:self.max_chars_per_page]
        }
    
    def generate_summary(self, content_data: Dict) -> Dict:
        """Generate short summary, bullets, and RAG chunk"""
        title = content_data['title']
        h1s = content_data['h1s']
        content = content_data['content']
        
        # Create short summary (1-2 sentences)
        sentences = [s.strip() for s in content.split('.') if s.strip()]
        if sentences:
            short_summary = '. '.join(sentences[:2]).strip()
            if not short_summary.endswith('.'):
                short_summary += '.'
        else:
            short_summary = f"Content from {title or 'web page'}."
        
        # Generate 5 key bullets
        bullets = []
        
        # Add H1 sections as bullets
        if h1s:
            bullets.extend([f"Section: {h1}" for h1 in h1s[:3]])
        
        # Extract key phrases from content
        if content:
            # Simple keyword extraction
            words = re.findall(r'\b[a-zA-Z]{4,}\b', content.lower())
            word_freq = {}
            for word in words:
                if word not in ['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'where', 'much', 'some', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'these', 'think', 'want', 'what', 'year', 'your', 'work', 'know', 'good', 'more', 'most', 'only', 'other', 'right', 'said', 'same', 'see', 'she', 'should', 'some', 'still', 'such', 'take', 'than', 'them', 'then', 'there', 'these', 'they', 'this', 'time', 'very', 'was', 'way', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'will', 'with', 'would', 'year', 'you', 'your']:
                    word_freq[word] = word_freq.get(word, 0) + 1
            
            # Add top frequent words as bullets
            top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:2]
            bullets.extend([f"Key topic: {word}" for word, _ in top_words])
        
        # Pad with generic bullets if needed
        while len(bullets) < 5:
            bullets.append("Additional information available")
        
        bullets = bullets[:5]
        
        # Create RAG chunk (<=1500 chars)
        rag_chunk = f"Title: {title}\n\n"
        if h1s:
            rag_chunk += f"Sections: {', '.join(h1s)}\n\n"
        
        # Add content, ensuring we don't exceed 1500 chars
        remaining_chars = 1500 - len(rag_chunk)
        if remaining_chars > 0:
            rag_chunk += content[:remaining_chars]
        
        return {
            'short_summary': short_summary,
            'bullets': bullets,
            'rag_chunk': rag_chunk[:1500]
        }
    
    def crawl_page(self, url: str) -> Optional[Dict]:
        """Crawl a single page and return structured data"""
        try:
            print(f"Crawling: {url}")
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            content_data = self.extract_content(response.text, url)
            summary_data = self.generate_summary(content_data)
            
            slug = self.create_slug(url, content_data['title'])
            
            return {
                'url': url,
                'slug': slug,
                'title': content_data['title'],
                'h1s': content_data['h1s'],
                'content': content_data['content'],
                'short_summary': summary_data['short_summary'],
                'bullets': summary_data['bullets'],
                'rag_chunk': summary_data['rag_chunk'],
                'crawled_at': datetime.now().isoformat(),
                'status': 'success'
            }
            
        except Exception as e:
            print(f"Error crawling {url}: {str(e)}")
            return {
                'url': url,
                'slug': self.create_slug(url),
                'title': 'Error',
                'status': 'error',
                'error': str(e),
                'crawled_at': datetime.now().isoformat()
            }
    
    def crawl(self) -> List[Dict]:
        """Main crawl method"""
        print(f"Starting demo crawl of {self.base_url} (max {self.max_pages} pages)")
        
        # For demo, we'll crawl some publicly accessible documentation sites
        demo_urls = [
            "https://docs.python.org/3/tutorial/introduction.html",
            "https://docs.python.org/3/tutorial/controlflow.html",
            "https://docs.python.org/3/tutorial/datastructures.html"
        ]
        
        for url in demo_urls[:self.max_pages]:
            page_data = self.crawl_page(url)
            if page_data:
                self.crawled_pages.append(page_data)
            time.sleep(2)  # Be respectful
        
        return self.crawled_pages
    
    def save_markdown(self, page_data: Dict, output_dir: Path):
        """Save page as markdown with frontmatter"""
        slug = page_data['slug']
        output_file = output_dir / f"{slug}.md"
        
        frontmatter = {
            'source_url': page_data['url'],
            'crawled_at': page_data['crawled_at'],
            'page_title': page_data['title']
        }
        
        content = f"""---
source_url: {frontmatter['source_url']}
crawled_at: {frontmatter['crawled_at']}
page_title: {frontmatter['page_title']}
---

# {page_data['title']}

## Summary
{page_data.get('short_summary', 'No summary available')}

## Key Points
{chr(10).join([f"- {bullet}" for bullet in page_data.get('bullets', [])])}

## Content
{page_data.get('content', 'No content available')}

## RAG Chunk
```
{page_data.get('rag_chunk', 'No RAG chunk available')}
```
"""
        
        output_file.write_text(content, encoding='utf-8')
        print(f"Saved: {output_file}")
    
    def create_index(self, output_dir: Path):
        """Create index.json with page metadata"""
        index_data = {
            'crawl_info': {
                'base_url': self.base_url,
                'max_pages': self.max_pages,
                'max_chars_per_page': self.max_chars_per_page,
                'crawled_at': datetime.now().isoformat(),
                'total_pages': len(self.crawled_pages)
            },
            'pages': []
        }
        
        for page in self.crawled_pages:
            page_metadata = {
                'slug': page['slug'],
                'url': page['url'],
                'title': page['title'],
                'short_summary': page.get('short_summary', ''),
                'bullets': page.get('bullets', []),
                'rag_chunk': page.get('rag_chunk', ''),
                'status': page['status'],
                'crawled_at': page['crawled_at']
            }
            index_data['pages'].append(page_metadata)
        
        index_file = output_dir / 'index.json'
        index_file.write_text(json.dumps(index_data, indent=2), encoding='utf-8')
        print(f"Created index: {index_file}")
        
        return index_data
    
    def generate_report(self) -> str:
        """Generate crawl report"""
        successful_pages = [p for p in self.crawled_pages if p['status'] == 'success']
        error_pages = [p for p in self.crawled_pages if p['status'] == 'error']
        
        report = f"""
# KB Crawl Report (Demo)

## Summary
- **Pages Crawled:** {len(self.crawled_pages)}
- **Successful:** {len(successful_pages)}
- **Errors:** {len(error_pages)}
- **Base URL:** {self.base_url}

## Pages Processed
"""
        
        for page in self.crawled_pages:
            status_icon = "✅" if page['status'] == 'success' else "❌"
            title = page['title'] or 'Untitled'
            report += f"- {status_icon} {title} ({page['url']})\n"
        
        if error_pages:
            report += "\n## Warnings\n"
            for page in error_pages:
                report += f"- Error crawling {page['url']}: {page.get('error', 'Unknown error')}\n"
        
        report += f"""
## Cost Estimate
- **Pages:** {len(self.crawled_pages)} × ~$0.001 = ~${len(self.crawled_pages) * 0.001:.3f}
- **Processing:** ~$0.0005
- **Total Estimated Cost:** ~${len(self.crawled_pages) * 0.001 + 0.0005:.3f}

## Notes
- Demo crawl with publicly accessible Python documentation
- Limited to {self.max_pages} pages for this run
- Respectful crawling with 2-second delays
- Content truncated to {self.max_chars_per_page} characters per page
"""
        
        return report

def main():
    """Main execution function for demo"""
    # Configuration
    base_url = "https://docs.python.org/3/tutorial/"
    max_pages = 3
    max_chars_per_page = 15000
    
    # Create output directory
    today = datetime.now().strftime("%Y%m%d")
    output_dir = Path(f"kb_crawl_demo/{today}")
    pages_dir = output_dir / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)
    
    # Initialize crawler
    crawler = DemoKBCrawler(base_url, max_pages, max_chars_per_page)
    
    # Perform crawl
    pages = crawler.crawl()
    
    # Save results
    for page in pages:
        if page['status'] == 'success':
            crawler.save_markdown(page, pages_dir)
    
    # Create index
    index_data = crawler.create_index(output_dir)
    
    # Generate and save report
    report = crawler.generate_report()
    report_file = output_dir / "crawl_report.md"
    report_file.write_text(report, encoding='utf-8')
    
    print("\n" + "="*50)
    print(report)
    print("="*50)

if __name__ == "__main__":
    main()
