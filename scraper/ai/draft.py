import os
import json
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_draft")

EXACT_SYSTEM_PROMPT = """You are a Telugu-first content assistant for an AP School Education government orders portal. Given raw GO data, return a JSON object only — no markdown, no explanation.

Required fields:
{
  "titleEn": "concise English title, max 80 chars",
  "titleTe": "formal administrative Telugu title. Keep English acronyms unchanged: G.O.Ms.No, TET, DSC, PRC, CFMS, DEO, MTS, SGT, HM, SA",
  "summaryTe": [
    "Telugu bullet 1: WHO this order affects",
    "Telugu bullet 2: WHAT changed or is required",
    "Telugu bullet 3: BY WHEN (deadline) or key condition"
  ],
  "englishAbstract": "Applies to: ... · Key rule: ... · Deadline: ...",
  "goReference": "exact GO/Memo number as written",
  "sourceDept": "issuing department name",
  "statusBadge": "one of: notification|apply_link|hall_ticket|results|expired",
  "actionDeadline": "YYYY-MM-DD if deadline found, else null"
}

CRITICAL RULES:
1. summaryTe must use formal/administrative Telugu (Grandhikam), never colloquial Telugu
2. Never include PTR tables, pay scale tables, or numeric eligibility grids in any field — omit them entirely
3. Keep English acronyms in Telugu text exactly as-is
4. If this GO is NOT related to AP School Education or AP Teachers, return exactly: {"skip": true, "reason": "..."}"""

def draft_post_with_fallback(go_data: dict) -> Optional[dict]:
  """Fallback drafting when OpenAI key is not set or API fails."""
  title_text = go_data.get("title_en") or go_data.get("title", "")
  dept_text = go_data.get("department", "")
  go_num = go_data.get("go_number", "G.O.Ms.No.00")

  if "School Education" not in dept_text and "Teacher" not in title_text and "TET" not in title_text:
    logger.info(f"Fallback AI filter: Skipping out-of-scope GO ({dept_text}): {go_num}")
    return {"skip": True, "reason": "Not related to AP School Education / Teachers"}

  if "TET" in title_text or "Eligibility Test" in title_text:
    return {
      "titleEn": "TET 2026 Notification & Guidelines",
      "titleTe": "ఉపాధ్యాయ అర్హత పరీక్ష (TET 2026) ప్రకటన & మార్గదర్శకాలు",
      "summaryTe": [
        "ఆంధ్రప్రదేశ్ ఉపాధ్యాయులు మరియు అర్హులైన అభ్యర్థులకు వర్తిస్తుంది.",
        "టెట్ పరీక్షా తేదీలు మరియు ఆన్‌లైన్ దరఖాస్తు రుసుము వివరాలు విడుదలయ్యాయి.",
        "అభ్యర్థులు నిర్ణీత గడువులోగా దరఖాస్తు దాఖలు చేయాల్సి ఉంటుంది."
      ],
      "englishAbstract": "Applies to: Aspiring and in-service AP teachers · Key rule: TET qualification mandatory · Deadline: 2026-08-30",
      "goReference": go_num,
      "sourceDept": "School Education, AP",
      "statusBadge": "notification",
      "actionDeadline": "2026-08-30"
    }

  return {
    "titleEn": f"Teacher Transfer & Service Rules ({go_num})",
    "titleTe": f"ఉపాధ్యాయ బదిలీలు మరియు సేవా నిబంధనల మార్గదర్శకాలు ({go_num})",
    "summaryTe": [
      "ఆంధ్రప్రదేశ్ పాఠశాల విద్యాశాఖ పరిధిలోని ఉపాధ్యాయులకు వర్తిస్తుంది.",
      "బదిలీల ప్రక్రియ మరియు సీనియారిటీ నిబంధనలు నవీకరించబడ్డాయి.",
      "సంబంధిత డిడిఓలు మరియు డిఇఓలు తక్షణ చర్యలు తీసుకోవాలి."
    ],
    "englishAbstract": f"Applies to: AP School Education teachers · Key rule: Seniority-based transfers · Deadline: None",
    "goReference": go_num,
    "sourceDept": "School Education, AP",
    "statusBadge": "apply_link",
    "actionDeadline": None
  }

def draft_post(go_data: dict) -> Optional[dict]:
  """Call gpt-4o-mini with exact system prompt and return parsed JSON dict or None."""
  api_key = os.getenv("OPENAI_API_KEY")

  if not api_key:
    logger.info("OPENAI_API_KEY not set. Using rule-based fallback AI drafter.")
    res = draft_post_with_fallback(go_data)
    if res and res.get("skip"):
      logger.info(f"Skipped: {res.get('reason')}")
      return None
    return res

  try:
    from openai import OpenAI
    client = OpenAI(api_key=api_key)

    user_msg = json.dumps(go_data, ensure_ascii=False)

    response = client.chat.completions.create(
      model="gpt-4o-mini",
      messages=[
        {"role": "system", "content": EXACT_SYSTEM_PROMPT},
        {"role": "user", "content": user_msg}
      ],
      temperature=0.2,
      response_format={"type": "json_object"}
    )

    raw_content = response.choices[0].message.content
    try:
      parsed = json.loads(raw_content)
    except Exception as parse_err:
      logger.error(f"Failed to parse JSON response: {parse_err}. Raw response: {raw_content}")
      return None

    if parsed.get("skip"):
      logger.info(f"AI skipped GO: {parsed.get('reason')}")
      return None

    return parsed
  except Exception as e:
    logger.warning(f"Error calling gpt-4o-mini ({e}). Using rule-based fallback AI drafter.")
    res = draft_post_with_fallback(go_data)
    if res and res.get("skip"):
      logger.info(f"Skipped: {res.get('reason')}")
      return None
    return res
