# Project Brief: Teacher Utility Tools for Website

## Background
Our website targets **government employees/teachers (AP & TS region)**. Competitor analysis was done on `amaravathiteacher.com`, a well-established portal in this niche, to identify what tools and content drive their traffic.

## Competitor Analysis — amaravathiteacher.com

The competitor aggregates niche tools/content rather than building single polished products:

- **Income tax calculators** — multiple Excel-based downloads, each authored/branded by a different individual (e.g. "Ramanjaneyulu Income Tax Software", "KSS Prasad Income Tax Software", "Putta Srinivas Income Tax Software"), updated per Financial Year / Assessment Year
- **Payroll & pension tools** — PRC (Pay Revision Commission) software, pension proposal software, GPF part-final withdrawal software, leave surrender/encashment bill software, increment proceeding software
- **Status checkers** — medical reimbursement status, CFMS bill status, scholarship payment status (simple links to govt portals, not custom-built)
- **Login link directory** — quick-access links to official govt portals (e-SR, CFMS, PFMS, income tax e-filing, etc.)
- **App download hub** — links to official govt mobile apps (DIKSHA, LEAP, PRASHAST, etc.)
- **Study material / exam papers** — separate content vertical for students (not in our scope)

**Key insight:** Their SEO strategy relies on hyper-specific, named search queries (e.g. "Ramanjaneyulu income tax software 2025-26 download"). Each tool gets its own dedicated page. Tools are mostly **downloadable Excel files**, not live interactive web tools — this is a gap we can exploit.

## Our Goal
Build similar utility tools tailored to teachers, but as **interactive web-based calculators** instead of downloadable Excel files, to:
- Increase user interest/engagement (matches what teachers are actively searching for)
- Differentiate from competitors by removing download friction and improving UX (works on mobile, no macro-enabled Excel needed)
- Capture the same SEO search intent with dedicated pages per tool

## Planned Tools (Priority Order)

1. **Income Tax Calculator** (web-based, interactive)
   - Old regime vs new regime comparison
   - AP/TS teacher salary structure inputs: Basic Pay, DA, HRA, standard deduction, other allowances
   - Should be built as an interactive component (e.g., React) with visual tax breakdown

2. **PRC / Pay Fixation Calculator**
   - Input: basic pay + PRC year
   - Output: revised pay, arrears, stagnation increments

3. **DA Arrears Calculator**
   - High search volume around each DA revision announcement

4. **Pension / GPF Calculator**
   - Retirement corpus estimate, monthly pension estimate

5. **Leave / HPL / Surrender Leave Bill Calculator**

6. **Status Checker Links Page**
   - Aggregated links: medical reimbursement status, CFMS bill status, etc.
   - Low effort, high search volume, mainly an aggregation/links page (not custom-built)

## Execution Notes
- Each tool = its own dedicated page/URL with keyword-rich titles (mirrors competitor's SEO pattern)
- Update tools yearly (FY/AY specific); keep older year versions live/indexed since people still search old years
- Prioritize web-based interactive tools over downloadable files for better engagement, mobile support, and analytics/ad control

## Next Step (In Progress)
Building a working prototype of the **Income Tax Calculator** as an interactive React component, with AP teacher salary heads (Basic, DA, HRA, etc.) baked in, including a visual tax breakdown chart.
