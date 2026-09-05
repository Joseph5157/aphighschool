#!/usr/bin/env python3
import os
import sys
import argparse
import logging
from dotenv import load_dotenv

# Ensure local imports work smoothly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from scraper/.env (or root .env fallback)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from sources.goir import fetch_new_gos
from sources.amaravathiteacher import fetch_latest_news as fetch_amaravathiteacher_news
from ai.draft import draft_post
from drafts.create import insert_draft

logging.basicConfig(level=logging.WARNING)

def run_scrape(source: str = "all", limit: int = 10):
  new_items = []
  if source in ("goir", "all"):
    print("Checking GOIR for new School Education GOs...")
    new_items.extend(fetch_new_gos())

  if source in ("amaravathiteacher", "all"):
    print("Checking AmaravathiTeacher.com for Latest News...")
    new_items.extend(fetch_amaravathiteacher_news(limit=limit))

  if not new_items:
    print("No new items found.")
    return

  drafted_count = 0
  skipped_count = 0

  for go in new_items:
    go_num = go.get("go_number", "")
    title_en = go.get("title_en") or go.get("title", "")
    print(f"Processing: {go_num} - {title_en}".encode('ascii', 'replace').decode('ascii'))

    draft = draft_post(go)

    if draft is None:
      print("  -> Skipped: out of scope")
      skipped_count += 1
      continue

    pdf_url = go.get("pdf_url")
    # Store full HTML content and source_url in draft if available
    if "content_html" in go:
      draft["contentHtml"] = go["content_html"]
    if "content" in go:
      draft["content"] = go["content"]
    if "source_url" in go:
      draft["sourceUrl"] = go["source_url"]

    success = insert_draft(draft, pdf_url)
    if success:
      drafted_count += 1
    else:
      skipped_count += 1

  print(f"Done. Found: {len(new_items)} | Drafted: {drafted_count} | Skipped: {skipped_count}")

def main():
  parser = argparse.ArgumentParser(description="AP Teacher Desk Scraper Service")
  subparsers = parser.add_subparsers(dest="command", help="Available commands")

  scrape_parser = subparsers.add_parser("scrape", help="Fetch new items, draft with AI/fallback, and save to Postgres")
  scrape_parser.add_argument("--source", choices=["goir", "amaravathiteacher", "all"], default="all", help="Source to scrape")
  scrape_parser.add_argument("--limit", type=int, default=10, help="Max items per source")

  args = parser.parse_args()

  if args.command == "scrape" or len(sys.argv) == 1 or (len(sys.argv) > 1 and sys.argv[1] == "scrape"):
    source = getattr(args, "source", "all")
    limit = getattr(args, "limit", 10)
    run_scrape(source=source, limit=limit)
  else:
    parser.print_help()

if __name__ == "__main__":
  main()
