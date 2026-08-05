import os
import re
import uuid
import time
import logging
import psycopg2
from urllib.parse import urlparse
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("create_draft")

VALID_STATUSES = {"notification", "apply_link", "hall_ticket", "results", "expired"}

def slugify(text: str) -> str:
  return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def insert_draft(post_data: dict, pdf_url: str) -> bool:
  """Insert a draft post directly into Postgres with isDraft = True."""
  db_url = os.getenv("DATABASE_URL")
  if not db_url or not post_data:
    logger.error("DATABASE_URL or post_data missing.")
    return False

  title_en = post_data.get("titleEn", "Draft Post")

  try:
    parsed = urlparse(db_url)
    conn = psycopg2.connect(
      dbname=parsed.path.lstrip('/'),
      user=parsed.username,
      password=parsed.password,
      host=parsed.hostname,
      port=parsed.port or 5432
    )
    cursor = conn.cursor()

    # Ensure isDraft column exists on Post table
    try:
      cursor.execute('ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "isDraft" BOOLEAN DEFAULT TRUE;')
      conn.commit()
    except Exception:
      conn.rollback()

    badge = post_data.get("statusBadge", "notification")
    if badge not in VALID_STATUSES:
      badge = "notification"

    # Base slug pattern matching Next.js actions/posts.ts: slugify(titleEn) + base36 timestamp
    timestamp_suffix = hex(int(time.time() * 1000))[2:]
    base_slug = f"{slugify(title_en)}-{timestamp_suffix}"

    # Parse actionDeadline
    deadline = post_data.get("actionDeadline")
    if deadline and isinstance(deadline, str):
      try:
        if len(deadline) == 10:
          deadline = datetime.strptime(deadline, "%Y-%m-%d")
        else:
          deadline = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
      except Exception:
        deadline = None

    # Get category ID
    cursor.execute('SELECT id FROM "Category" LIMIT 1;')
    cat_row = cursor.fetchone()
    category_id = cat_row[0] if cat_row else None

    summary_te = post_data.get("summaryTe", [])
    if isinstance(summary_te, str):
      summary_te = [summary_te]

    # Attempt insertion with slug retry
    attempts = 0
    slug = base_slug
    inserted = False

    while attempts < 3 and not inserted:
      try:
        post_id = str(uuid.uuid4())
        insert_query = """
          INSERT INTO "Post" (
            "id", "slug", "titleEn", "titleTe", "summaryTe", "englishAbstract",
            "statusBadge", "pdfUrl", "actionDeadline", "categoryId",
            "goReference", "sourceDept", "sourceUrl", "verifiedAgainstGoir", "isDraft",
            "createdAt", "updatedAt"
          ) VALUES (
            %s, %s, %s, %s, %s, %s,
            %s::"PostStatus", %s, %s, %s,
            %s, %s, %s, %s, %s,
            NOW(), NOW()
          );
        """

        cursor.execute(insert_query, (
          post_id,
          slug,
          title_en,
          post_data.get("titleTe", ""),
          summary_te,
          post_data.get("englishAbstract"),
          badge,
          pdf_url or post_data.get("pdfUrl"),
          deadline,
          category_id,
          post_data.get("goReference"),
          post_data.get("sourceDept", "School Education, AP"),
          "https://goir.ap.gov.in",
          True, # verifiedAgainstGoir
          True  # isDraft
        ))

        conn.commit()
        inserted = True
        print(f"✓ Draft created: {title_en}")
      except psycopg2.IntegrityError as ie:
        conn.rollback()
        attempts += 1
        slug = f"{base_slug}-{attempts + 1}"
      except Exception as ex:
        conn.rollback()
        logger.error(f"Error inserting draft post '{title_en}': {ex}")
        break

    cursor.close()
    conn.close()
    return inserted

  except Exception as e:
    logger.error(f"Postgres connection error in insert_draft: {e}")
    return False
