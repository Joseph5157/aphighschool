import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AP Teachers Portal database...");

  // Cleanup Old Categories
  await prisma.post.updateMany({
    where: {
      category: {
        slug: {
          notIn: [
            'govt-orders','circulars','memos',
            'proceedings','notifications','tools'
          ]
        }
      }
    },
    data: { categoryId: null }
  });

  await prisma.category.deleteMany({
    where: {
      slug: {
        notIn: [
          'govt-orders','circulars','memos',
          'proceedings','notifications','tools'
        ]
      }
    }
  });

  // 1. Categories
  const govtOrders = await prisma.category.upsert({
    where: { slug: "govt-orders" },
    update: { color: "#185fa5", icon: "file" },
    create: { nameEn: "Government Orders", nameTe: "ప్రభుత్వ ఉత్తర్వులు", slug: "govt-orders", color: "#185fa5", icon: "file" },
  });

  const circulars = await prisma.category.upsert({
    where: { slug: "circulars" },
    update: { color: "#854f0b", icon: "file-text" },
    create: { nameEn: "Circulars", nameTe: "సర్క్యులర్లు", slug: "circulars", color: "#854f0b", icon: "file-text" },
  });

  const memos = await prisma.category.upsert({
    where: { slug: "memos" },
    update: { color: "#5c3a21", icon: "file-symlink" },
    create: { nameEn: "Memos", nameTe: "మెమోలు", slug: "memos", color: "#5c3a21", icon: "file-symlink" },
  });

  const proceedings = await prisma.category.upsert({
    where: { slug: "proceedings" },
    update: { color: "#2F6B4F", icon: "file-certificate" },
    create: { nameEn: "Proceedings", nameTe: "ప్రొసీడింగ్స్", slug: "proceedings", color: "#2F6B4F", icon: "file-certificate" },
  });

  const notifications = await prisma.category.upsert({
    where: { slug: "notifications" },
    update: { color: "#B5432E", icon: "bell" },
    create: { nameEn: "Notifications", nameTe: "ప్రకటనలు", slug: "notifications", color: "#B5432E", icon: "bell" },
  });

  const tools = await prisma.category.upsert({
    where: { slug: "tools" },
    update: { color: "#1B2A4A", icon: "tool" },
    create: { nameEn: "Tools", nameTe: "ఉపకరణాలు", slug: "tools", color: "#1B2A4A", icon: "tool" },
  });

  // Seed records are demo fixtures, not real orders. They are created as UNPUBLISHED
  // drafts with verifiedAgainstGoir=false and no PDF or source URL. A real post is
  // verified by a human against GOIR and published deliberately from the admin UI.

  // 2. Background Post (GO 21)
  const background = await prisma.post.upsert({
    where: { slug: "go-21-original-ptr-norms" },
    update: {
      isDraft: true,
      categoryId: govtOrders.id,
      documentType: "go",
      tags: ["Transfers", "PTR"],
      titleEn: "[DEMO] Original PTR Norms & Staff Restructuring Guidelines",
      verifiedAgainstGoir: false,
      pdfUrl: null,
      sourceUrl: null,
    },
    create: {
      slug: "go-21-original-ptr-norms",
      titleEn: "[DEMO] Original PTR Norms & Staff Restructuring Guidelines",
      titleTe: "అసలు పీటీఆర్ నిబంధనలు మరియు సిబ్బంది పునర్వ్యవస్థీకరణ మార్గదర్శకాలు",
      summaryTe: [
        "పాఠశాలల్లో ఉపాధ్యాయ-విద్యార్థి నిష్పత్తి (PTR) ప్రాథమిక నిబంధనలు నిర్దేశించబడ్డాయి.",
        "ప్రాథమిక మరియు ప్రాథమికోన్నత పాఠశాలల పోస్టుల మంజూరు వర్తిస్తుంది.",
      ],
      englishAbstract: "Applies to: All AP Government & ZP Primary/UP Schools · Key rule: Base Pupil-Teacher Ratio norms",
      statusBadge: "expired",
      goReference: "G.O.Ms.No.21",
      sourceDept: "School Education, AP",
      sourceUrl: null,
      categoryId: govtOrders.id,
      documentType: "go",
      tags: ["Transfers", "PTR"],
      verifiedAgainstGoir: false,
      isDraft: true,
    },
  });

  // 3. District Allocation Post (GO 129)
  const main2026 = await prisma.post.upsert({
    where: { slug: "go-129-district-allocation-2026" },
    update: {
      isDraft: true,
      categoryId: govtOrders.id,
      documentType: "go",
      tags: ["Transfers"],
      titleEn: "[DEMO] New District Allocation Guidelines for Teachers & Educational Staff",
      verifiedAgainstGoir: false,
      pdfUrl: null,
      sourceUrl: null,
    },
    create: {
      slug: "go-129-district-allocation-2026",
      titleEn: "[DEMO] New District Allocation Guidelines for Teachers & Educational Staff",
      titleTe: "నూతన జిల్లాల్లో ఉపాధ్యాయులు మరియు విద్యాశాఖ సిబ్బంది కేటాయింపు మార్గదర్శకాలు",
      summaryTe: [
        "అర్హులైన ఉపాధ్యాయులు మరియు ఉద్యోగులు ఆగస్టు 30లోగా ఆన్‌లైన్ దరఖాస్తు చేసుకోవాలి.",
        "సీనియారిటీ మరియు స్పౌజ్ పాయింట్ల ఆధారంగా జిల్లాల కేటాయింపు ప్రక్రియ నిర్వహించబడుతుంది.",
        "కేటాయింపు ఉత్తర్వులు వెలువడిన 3 రోజుల్లోగా నూతన స్థానాల్లో చేరవలసి ఉంటుంది.",
      ],
      englishAbstract: "Applies to: All AP Teachers & School Education Staff · Key rule: Seniority & Spouse points allotment · Deadline: 2026-08-30",
      statusBadge: "apply_link",
      pdfUrl: null,
      actionUrl: "https://cse.ap.gov.in",
      actionDeadline: new Date("2026-08-30"),
      goReference: "G.O.Ms.No.129",
      sourceDept: "School Education, AP",
      sourceUrl: null,
      categoryId: govtOrders.id,
      documentType: "go",
      tags: ["Transfers"],
      verifiedAgainstGoir: false,
      isDraft: true,
    },
  });

  // 4. TET 2026 Post
  const tetPost = await prisma.post.upsert({
    where: { slug: "ap-tet-2026-notification-guidelines" },
    update: {
      isDraft: true,
      categoryId: notifications.id,
      documentType: "notification",
      tags: ["TET"],
      titleEn: "[DEMO] AP TET 2026 Official Notification & Online Application Guidelines",
      verifiedAgainstGoir: false,
      pdfUrl: null,
      sourceUrl: "https://aptet.apcfss.in",
    },
    create: {
      slug: "ap-tet-2026-notification-guidelines",
      titleEn: "[DEMO] AP TET 2026 Official Notification & Online Application Guidelines",
      titleTe: "ఆంధ్రప్రదేశ్ ఉపాధ్యాయ అర్హత పరీక్ష (AP TET 2026) అధికారిక ప్రకటన & ఆన్‌లైన్ దరఖాస్తు మార్గదర్శకాలు",
      summaryTe: [
        "ఆంధ్రప్రదేశ్ ఉపాధ్యాయ అర్హత పరీక్ష (TET 2026) దరఖాస్తు స్వీకరణ ప్రారంభమైనది.",
        "పేపర్-1 (SGT) మరియు పేపర్-2 (School Assistant) పరీక్షలకు ఆన్‌లైన్‌లో రుసుము చెల్లించాలి.",
        "దరఖాస్తు సమర్పణకు చివరి తేదీ ఆగస్టు 25, 2026.",
      ],
      englishAbstract: "Applies to: D.El.Ed / B.Ed candidates & In-service teachers · Key rule: Computer Based Test (CBT) · Deadline: 2026-08-25",
      statusBadge: "notification",
      pdfUrl: null,
      actionUrl: "https://aptet.apcfss.in",
      actionDeadline: new Date("2026-08-25"),
      goReference: "Memo.No.1742/TET/2026",
      sourceDept: "School Education, AP",
      sourceUrl: "https://aptet.apcfss.in",
      categoryId: notifications.id,
      documentType: "notification",
      tags: ["TET"],
      verifiedAgainstGoir: false,
      isDraft: true,
    },
  });

  // 5. DSC 2026 Hall Tickets Post
  const dscPost = await prisma.post.upsert({
    where: { slug: "ap-dsc-2026-hall-tickets-release" },
    update: {
      isDraft: true,
      categoryId: notifications.id,
      documentType: "notification",
      tags: ["DSC"],
      titleEn: "[DEMO] AP Mega DSC 2026 Examination Hall Tickets Released Download Link",
      verifiedAgainstGoir: false,
      pdfUrl: null,
      sourceUrl: "https://apdsc.apcfss.in",
    },
    create: {
      slug: "ap-dsc-2026-hall-tickets-release",
      titleEn: "[DEMO] AP Mega DSC 2026 Examination Hall Tickets Released Download Link",
      titleTe: "ఆంధ్రప్రదేశ్ మెగా డీఎస్సీ 2026 పరీక్ష హాల్ టిక్కెట్లు విడుదల - డౌన్‌లోడ్ లింక్",
      summaryTe: [
        "మెగా డీఎస్సీ 2026 హాల్ టిక్కెట్లు అధికారిక పోర్టల్‌లో అందుబాటులో ఉంచబడ్డాయి.",
        "అభ్యర్థులు తమ ఆధార్ సంఖ్య లేదా అప్లికేషన్ ఐడీతో హాల్ టికెట్ డౌన్‌లోడ్ చేసుకోవచ్చు.",
        "పరీక్షా కేంద్రంలోకి గుర్తింపు కార్డుతో పాటు ప్రింటెడ్ హాల్ టికెట్ తప్పనిసరి.",
      ],
      englishAbstract: "Applies to: All registered Mega DSC 2026 applicants · Key rule: Print hall ticket with valid Govt Photo ID",
      statusBadge: "hall_ticket",
      pdfUrl: null,
      actionUrl: "https://apdsc.apcfss.in",
      goReference: "G.O.Rt.No.408",
      sourceDept: "School Education, AP",
      sourceUrl: "https://apdsc.apcfss.in",
      categoryId: notifications.id,
      documentType: "notification",
      tags: ["DSC"],
      verifiedAgainstGoir: false,
      isDraft: true,
    },
  });

  // 6. DA Arrears Post
  const daPost = await prisma.post.upsert({
    where: { slug: "da-arrears-payment-schedule-2026" },
    update: {
      isDraft: true,
      categoryId: circulars.id,
      documentType: "circular",
      tags: ["PRC", "DA"],
      titleEn: "[DEMO] Dearness Allowance (DA) Arrears Installments Release Orders",
      verifiedAgainstGoir: false,
      pdfUrl: null,
      sourceUrl: null,
    },
    create: {
      slug: "da-arrears-payment-schedule-2026",
      titleEn: "[DEMO] Dearness Allowance (DA) Arrears Installments Release Orders",
      titleTe: "కరువు భత్యం (DA) బకాయిల వాయిదాల విడుదల ఉత్తర్వులు",
      summaryTe: [
        "ఉపాధ్యాయులు మరియు ప్రభుత్వ ఉద్యోగుల కరువు భత్యం (DA) బకాయిలు జీపిఎఫ్ అకౌంట్‌లో జమ చేసేందుకు ఉత్తర్వులు.",
        "సిఎఫ్ఎమ్ఎస్ (CFMS) ద్వారా బిల్లులు తయారు చేయాల్సిందిగా డిడిఓలకు ఆదేశాలు.",
      ],
      englishAbstract: "Applies to: All AP Govt Teachers & Pensioners · Key rule: GPF adjustment in 3 installments",
      statusBadge: "results",
      pdfUrl: null,
      goReference: "G.O.Ms.No.84",
      sourceDept: "Finance Department, AP",
      sourceUrl: null,
      categoryId: circulars.id,
      documentType: "circular",
      tags: ["PRC", "DA"],
      verifiedAgainstGoir: false,
      isDraft: true,
    },
  });

  // Related Orders link: GO 129 -> GO 21 background order
  await prisma.relatedOrder.upsert({
    where: { postId_relatedPostId: { postId: main2026.id, relatedPostId: background.id } },
    update: {},
    create: {
      postId: main2026.id,
      relatedPostId: background.id,
      relationshipNote: "Original PTR norms amended by this order",
      source: "manual",
      approved: true,
    },
  });

  console.log("Seed completed successfully with 5 posts across 6 categories!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
