import re
import logging
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("apteachers_source")

BASE_URL = "https://www.apteachers.in/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def extract_pdf_or_download_link(soup: BeautifulSoup) -> Optional[str]:
    """Find key download links (drive.google.com, .pdf, apcfss.in, cse.ap.gov.in) in article."""
    if not soup:
        return None
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "drive.google.com" in href or href.endswith(".pdf") or "apcfss.in" in href or "cse.ap.gov.in" in href:
            return href
    return None

def extract_go_reference(text: str) -> Optional[str]:
    """Extract G.O. / Memo / Proceeding reference if present in text."""
    match = re.search(r'(G\.?O\.?\s*(?:Ms|Rt)?\.?\s*No\.?\s*\d+|Memo\s*No\.?\s*[\d\w-]+|Proc\.?\s*R\.?C\.?\s*No\.?\s*[\d\w-]+)', text, re.IGNORECASE)
    if match:
        return match.group(1)
    return None

def fetch_single_article(url: str) -> Optional[Dict]:
    """Fetch full article details from single apteachers.in article URL."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            logger.error(f"Failed to fetch article {url}, status: {resp.status_code}")
            return None

        soup = BeautifulSoup(resp.text, "html.parser")
        
        # Post title
        title_el = soup.find("h1", class_=re.compile(r'post-title|entry-title|name|title'))
        title = title_el.get_text(strip=True) if title_el else ""
        if not title:
            title_el = soup.find("h1")
            title = title_el.get_text(strip=True) if title_el else ""

        # Post content
        entry_el = soup.find("div", class_=re.compile(r'entry-content|post-body|entry'))
        content_text = entry_el.get_text(separator="\n", strip=True) if entry_el else ""

        # Remove ads / unwanted scripts from entry HTML
        if entry_el:
            for s in entry_el.find_all(["script", "style", "ins", "iframe"]):
                s.decompose()
            entry_html = str(entry_el)
        else:
            entry_html = ""

        pdf_url = extract_pdf_or_download_link(entry_el or soup)
        go_ref = extract_go_reference(content_text) or title

        return {
            "title": title,
            "title_en": title,
            "department": "School Education, AP",
            "go_number": go_ref,
            "content": content_text[:3000],  # Text summary for AI
            "content_html": entry_html,      # Clean HTML for detail view
            "pdf_url": pdf_url,
            "source_url": url,
        }
    except Exception as e:
        logger.error(f"Error fetching article {url}: {e}")
        return None

def fetch_latest_news(limit: int = 10) -> List[Dict]:
    """Fetch latest news articles from APTeachers.in main page."""
    logger.info(f"Fetching latest news from {BASE_URL}")
    articles = []
    
    try:
        resp = requests.get(BASE_URL, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            logger.error(f"Failed to fetch APTeachers main page, status: {resp.status_code}")
            return articles

        soup = BeautifulSoup(resp.text, "html.parser")
        
        link_elements = soup.find_all("a", href=True)
        article_urls = []
        seen = set()

        for a in link_elements:
            href = a["href"]
            if "apteachers.in/" in href and not any(x in href for x in ["/category/", "/tag/", "/page/", "wp-content", "#", "?", "/search", "privacy-policy", "contact-us"]):
                if href not in seen and href != "https://www.apteachers.in/" and href != "https://apteachers.in/":
                    seen.add(href)
                    article_urls.append(href)

        logger.info(f"Found {len(article_urls)} candidate article links on APTeachers.in.")

        for url in article_urls[:limit]:
            logger.info(f"Scraping APTeachers article: {url}")
            article_data = fetch_single_article(url)
            if article_data and article_data["title"]:
                articles.append(article_data)

    except Exception as e:
        logger.error(f"Error in APTeachers fetch_latest_news: {e}")

    return articles
