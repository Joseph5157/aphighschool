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
from ai.draft import draft_post
from drafts.create import insert_draft

logging.basicConfig(level=logging.WARNING)

def run_scrape():
  print("Checking GOIR for new School Education GOs...")
  new_gos = fetch_new_gos()

  if not new_gos:
    print("No new GOs found.")
    return

  drafted_count = 0
  skipped_count = 0

  for go in new_gos:
    go_num = go.get("go_number", "")
    title_en = go.get("title_en") or go.get("title", "")
    print(f"Processing: {go_num} — {title_en}")

    draft = draft_post(go)

    if draft is None:
      print("  -> Skipped: out of scope")
      skipped_count += 1
      continue

    pdf_url = go.get("pdf_url")
    success = insert_draft(draft, pdf_url)
    if success:
      drafted_count += 1
    else:
      skipped_count += 1

  print(f"Done. Found: {len(new_gos)} | Drafted: {drafted_count} | Skipped: {skipped_count}")

def main():
  parser = argparse.ArgumentParser(description="AP Teacher Desk GOIR Scraper Service")
  subparsers = parser.add_subparsers(dest="command", help="Available commands")

  scrape_parser = subparsers.add_parser("scrape", help="Fetch new GOs from GOIR, draft with gpt-4o-mini, and save to Postgres")

  args = parser.parse_args()

  if args.command == "scrape" or len(sys.argv) == 1 or (len(sys.argv) > 1 and sys.argv[1] == "scrape"):
    run_scrape()
  else:
    parser.print_help()

if __name__ == "__main__":
  main()
