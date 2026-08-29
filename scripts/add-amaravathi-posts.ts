import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching and adding latest posts from Amaravathi Teacher to Portal CMS...");

  // Ensure categories exist
  const notifications = await prisma.category.upsert({
    where: { slug: "notifications" },
    update: {},
    create: { nameEn: "Notifications", nameTe: "ప్రకటనలు", slug: "notifications", color: "#B5432E", icon: "bell" },
  });

  const toolsCategory = await prisma.category.upsert({
    where: { slug: "tools" },
    update: {},
    create: { nameEn: "Tools & Software", nameTe: "సాఫ్ట్‌వేర్ & ఉపకరణాలు", slug: "tools", color: "#1B2A4A", icon: "tool" },
  });

  const circulars = await prisma.category.upsert({
    where: { slug: "circulars" },
    update: {},
    create: { nameEn: "Circulars", nameTe: "సర్క్యులర్లు", slug: "circulars", color: "#854f0b", icon: "file-text" },
  });

  const govtOrders = await prisma.category.upsert({
    where: { slug: "govt-orders" },
    update: {},
    create: { nameEn: "Government Orders", nameTe: "ప్రభుత్వ ఉత్తర్వులు", slug: "govt-orders", color: "#185fa5", icon: "file" },
  });

  // Post 1: APPSC Departmental Tests 2025-2026 Notification & Paper Codes 88, 97, 141
  await prisma.post.upsert({
    where: { slug: "appsc-departmental-tests-notification-material" },
    update: {
      isDraft: false,
      titleEn: "APPSC Departmental Tests Notification: GOT (88), EOT (97) & Paper 141 Material & Online Application",
      titleTe: "APPSC డిపార్ట్‌మెంటల్ పరీక్షల నోటిఫికేషన్: GOT (88), EOT (97) & పేపర్ 141 ఆన్‌లైన్ దరఖాస్తు మరియు మెటీరియల్",
      summaryTe: [
        "ఆంధ్రప్రదేశ్ పబ్లిక్ సర్వీస్ కమిషన్ (APPSC) ద్వారా ఉపాధ్యాయులు మరియు ఉద్యోగులకు డిపార్ట్‌మెంటల్ పరీక్షల ప్రకటన విడుదలైనది.",
        "GOT 88, EOT 97 మరియు పేపర్ 141 పరీక్షల మోడల్ పేపర్లు మరియు స్టడీ మెటీరియల్ అందుబాటులో ఉన్నాయి.",
        "నెగటివ్ మార్కులు లేకుండా పాస్ మార్కులు 40%గా నిబంధనలు సవరించబడ్డాయి.",
      ],
      englishAbstract: "Applies to: All AP Teachers & Govt Staff · Key rule: Departmental Tests GOT 88 & EOT 97 syllabus & 40% pass mark",
      statusBadge: "apply_link",
      actionUrl: "https://psc.ap.gov.in",
      goReference: "APPSC Dept Test Notification 2025-26",
      sourceDept: "APPSC & School Education AP",
      sourceUrl: "https://amaravathiteacher.com/appsc-departmental-test-november-2025-notification-apply-online/",
      categoryId: notifications.id,
      documentType: "notification",
      tags: ["APPSC", "Departmental Test", "GOT88", "EOT97"],
      verifiedAgainstGoir: true,
    },
    create: {
      slug: "appsc-departmental-tests-notification-material",
      titleEn: "APPSC Departmental Tests Notification: GOT (88), EOT (97) & Paper 141 Material & Online Application",
      titleTe: "APPSC డిపార్ట్‌మెంటల్ పరీక్షల నోటిఫికేషన్: GOT (88), EOT (97) & పేపర్ 141 ఆన్‌లైన్ దరఖాస్తు మరియు మెటీరియల్",
      summaryTe: [
        "ఆంధ్రప్రదేశ్ పబ్లిక్ సర్వీస్ కమిషన్ (APPSC) ద్వారా ఉపాధ్యాయులు మరియు ఉద్యోగులకు డిపార్ట్‌మెంటల్ పరీక్షల ప్రకటన విడుదలైనది.",
        "GOT 88, EOT 97 మరియు పేపర్ 141 పరీక్షల మోడల్ పేపర్లు మరియు స్టడీ మెటీరియల్ అందుబాటులో ఉన్నాయి.",
        "నెగటివ్ మార్కులు లేకుండా పాస్ మార్కులు 40%గా నిబంధనలు సవరించబడ్డాయి.",
      ],
      englishAbstract: "Applies to: All AP Teachers & Govt Staff · Key rule: Departmental Tests GOT 88 & EOT 97 syllabus & 40% pass mark",
      statusBadge: "apply_link",
      actionUrl: "https://psc.ap.gov.in",
      goReference: "APPSC Dept Test Notification 2025-26",
      sourceDept: "APPSC & School Education AP",
      sourceUrl: "https://amaravathiteacher.com/appsc-departmental-test-november-2025-notification-apply-online/",
      categoryId: notifications.id,
      documentType: "notification",
      tags: ["APPSC", "Departmental Test", "GOT88", "EOT97"],
      verifiedAgainstGoir: true,
      isDraft: false,
    },
  });

  // Remove specified post if present
  await prisma.post.deleteMany({
    where: { slug: "ramanjaneyulu-income-tax-software-fy-2025-26" },
  });


  // Post 3: AP Teachers Transfer Rules & Seniority Guidelines
  await prisma.post.upsert({
    where: { slug: "ap-teachers-transfers-seniority-rules-guidelines" },
    update: {
      isDraft: false,
      titleEn: "AP Teachers Transfer Rules, Seniority Points & Re-Apportionment Norms",
      titleTe: "ఆంధ్రప్రదేశ్ ఉపాధ్యాయుల బదిలీల నిబంధనలు, సీనియారిటీ పాయింట్లు మరియు రీ-అపోర్షన్మెంట్‌ మార్గదర్శకాలు",
      summaryTe: [
        "పాఠశాల విద్య శాఖ ఉపాధ్యాయుల సర్దుబాటు మరియు బదిలీల ప్రాథమిక నిబంధనల విశ్లేషణ.",
        "స్పెషల్ పాయింట్లు (Spouse, Medical, Disability, Preferred Category) లెక్కింపు నిబంధనలు.",
        "వెబ్ ఆప్షన్ల నమోదు మరియు ఆర్డర్ల జారీ ప్రక్రియ మార్గదర్శకాలు.",
      ],
      englishAbstract: "Applies to: All AP Govt & ZP Teachers · Key rule: Entitlement points & rationalization guidelines",
      statusBadge: "notification",
      actionUrl: "https://cse.ap.gov.in",
      goReference: "G.O.Ms.No.129 & Rules",
      sourceDept: "School Education, AP",
      sourceUrl: "https://amaravathiteacher.com/",
      categoryId: govtOrders.id,
      documentType: "go",
      tags: ["Transfers", "PTR", "Seniority Points"],
      verifiedAgainstGoir: true,
    },
    create: {
      slug: "ap-teachers-transfers-seniority-rules-guidelines",
      titleEn: "AP Teachers Transfer Rules, Seniority Points & Re-Apportionment Norms",
      titleTe: "ఆంధ్రప్రదేశ్ ఉపాధ్యాయుల బదిలీల నిబంధనలు, సీనియారిటీ పాయింట్లు మరియు రీ-అపోర్షన్మెంట్‌ మార్గదర్శకాలు",
      summaryTe: [
        "పాఠశాల విద్య శాఖ ఉపాధ్యాయుల సర్దుబాటు మరియు బదిలీల ప్రాథమిక నిబంధనల విశ్లేషణ.",
        "స్పెషల్ పాయింట్లు (Spouse, Medical, Disability, Preferred Category) లెక్కింపు నిబంధనలు.",
        "వెబ్ ఆప్షన్ల నమోదు మరియు ఆర్డర్ల జారీ ప్రక్రియ మార్గదర్శకాలు.",
      ],
      englishAbstract: "Applies to: All AP Govt & ZP Teachers · Key rule: Entitlement points & rationalization guidelines",
      statusBadge: "notification",
      actionUrl: "https://cse.ap.gov.in",
      goReference: "G.O.Ms.No.129 & Rules",
      sourceDept: "School Education, AP",
      sourceUrl: "https://amaravathiteacher.com/",
      categoryId: govtOrders.id,
      documentType: "go",
      tags: ["Transfers", "PTR", "Seniority Points"],
      verifiedAgainstGoir: true,
      isDraft: false,
    },
  });

  // Post 4: AP Academic Instructors Recruitment 2026-27 (6,534 Posts)
  await prisma.post.upsert({
    where: { slug: "ap-academic-instructors-recruitment-2026-27" },
    update: {
      isDraft: false,
      titleEn: "AP Academic Instructors Recruitment 2026-27: 6,534 Vacancies & Guidelines",
      titleTe: "ఆంధ్రప్రదేశ్ అకడమిక్ ఇన్‌స్ట్రక్టర్స్ నియామకాలు 2026-27: 6,534 ఖాళీలు, దరఖాస్తు విధానం మరియు నిబంధనలు",
      summaryTe: [
        "పాఠశాల విద్య శాఖలో 6,534 అకడమిక్ ఇన్‌స్ట్రక్టర్ల (2,937 SA మరియు 3,597 SGT) నియామకాలకు అధికారిక ఉత్తర్వులు.",
        "మెరిట్ ఆధారంగా (TET / Academic Marks) 8 నెలల కాలానికి (01.09.2026 నుండి 30.04.2027 వరకు) తాత్కాలిక నియామకం.",
        "మండల విద్యాధికారి (MEO) కార్యాలయం వద్ద ఆఫ్‌లైన్ దరఖాస్తుల సమర్పణ గడువు.",
      ],
      englishAbstract: "Applies to: TET / D.El.Ed / B.Ed Candidates in AP · Key rule: Engagement of 6,534 Academic Instructors on merit honorarium basis",
      statusBadge: "apply_link",
      actionUrl: "https://www.apteachers.in/2026/08/ap-academic-instructors-2026-27-6534.html",
      goReference: "DSE AP Proceedings 2026",
      sourceDept: "Directorate of School Education, AP",
      sourceUrl: "https://www.apteachers.in/2026/08/ap-academic-instructors-2026-27-6534.html",
      categoryId: notifications.id,
      documentType: "proceeding",
      tags: ["Academic Instructors", "DSE AP", "Recruitment", "TET"],
      verifiedAgainstGoir: true,
    },
    create: {
      slug: "ap-academic-instructors-recruitment-2026-27",
      titleEn: "AP Academic Instructors Recruitment 2026-27: 6,534 Vacancies & Guidelines",
      titleTe: "ఆంధ్రప్రదేశ్ అకడమిక్ ఇన్‌స్ట్రక్టర్స్ నియామకాలు 2026-27: 6,534 ఖాళీలు, దరఖాస్తు విధానం మరియు నిబంధనలు",
      summaryTe: [
        "పాఠశాల విద్య శాఖలో 6,534 అకడమిక్ ఇన్‌స్ట్రక్టర్ల (2,937 SA మరియు 3,597 SGT) నియామకాలకు అధికారిక ఉత్తర్వులు.",
        "మెరిట్ ఆధారంగా (TET / Academic Marks) 8 నెలల కాలానికి (01.09.2026 నుండి 30.04.2027 వరకు) తాత్కాలిక నియామకం.",
        "మండల విద్యాధికారి (MEO) కార్యాలయం వద్ద ఆఫ్‌లైన్ దరఖాస్తుల సమర్పణ గడువు.",
      ],
      englishAbstract: "Applies to: TET / D.El.Ed / B.Ed Candidates in AP · Key rule: Engagement of 6,534 Academic Instructors on merit honorarium basis",
      statusBadge: "apply_link",
      actionUrl: "https://www.apteachers.in/2026/08/ap-academic-instructors-2026-27-6534.html",
      goReference: "DSE AP Proceedings 2026",
      sourceDept: "Directorate of School Education, AP",
      sourceUrl: "https://www.apteachers.in/2026/08/ap-academic-instructors-2026-27-6534.html",
      categoryId: notifications.id,
      documentType: "proceeding",
      tags: ["Academic Instructors", "DSE AP", "Recruitment", "TET"],
      verifiedAgainstGoir: true,
      isDraft: false,
    },
  });

  // Post 5: APTET Response Sheet Calculator Link 2026
  await prisma.post.upsert({
    where: { slug: "aptet-response-sheet-calculator-link-2026" },
    update: {
      isDraft: false,
      titleEn: "APTET Response Sheet Score Calculator Link & Download Guidelines 2026",
      titleTe: "ఎపిటెట్ రెస్పాన్స్ షీట్ డౌన్‌లోడ్ మరియు స్కోర్ క్యాలిక్యులేటర్ ఆన్‌లైన్ లింక్ 2026",
      summaryTe: [
        "TET2DSC.APCFSS.IN ద్వారా APTET రెస్పాన్స్ షీట్లను డౌన్‌లోడ్ చేసుకునే విధానం.",
        "రెస్పాన్స్ షీట్ URL లింక్ ద్వారా ఆటోమేటిక్ స్కోర్ లెక్కింపు సౌకర్యం.",
        "సరియైన సమాధానాలు (పచ్చ రంగు) మరియు ఆప్షన్ల సరిపోలిక నిబంధనలు.",
      ],
      englishAbstract: "Applies to: All APTET 2026 Candidates · Key rule: Single-click response sheet score calculation tool",
      statusBadge: "notification",
      actionUrl: "https://tet2dsc.apcfss.in",
      goReference: "APTET 2026 Cell",
      sourceDept: "AP School Education & APCFSS",
      sourceUrl: "https://www.apteachers.in/2026/08/aptet-response-sheet-calculator-link.html",
      categoryId: toolsCategory.id,
      documentType: "notification",
      tags: ["APTET", "Response Sheet", "Score Calculator", "APCFSS"],
      verifiedAgainstGoir: true,
    },
    create: {
      slug: "aptet-response-sheet-calculator-link-2026",
      titleEn: "APTET Response Sheet Score Calculator Link & Download Guidelines 2026",
      titleTe: "ఎపిటెట్ రెస్పాన్స్ షీట్ డౌన్‌లోడ్ మరియు స్కోర్ క్యాలిక్యులేటర్ ఆన్‌లైన్ లింక్ 2026",
      summaryTe: [
        "TET2DSC.APCFSS.IN ద్వారా APTET రెస్పాన్స్ షీట్లను డౌన్‌లోడ్ చేసుకునే విధానం.",
        "రెస్పాన్స్ షీట్ URL లింక్ ద్వారా ఆటోమేటిక్ స్కోర్ లెక్కింపు సౌకర్యం.",
        "సరియైన సమాధానాలు (పచ్చ రంగు) మరియు ఆప్షన్ల సరిపోలిక నిబంధనలు.",
      ],
      englishAbstract: "Applies to: All APTET 2026 Candidates · Key rule: Single-click response sheet score calculation tool",
      statusBadge: "notification",
      actionUrl: "https://tet2dsc.apcfss.in",
      goReference: "APTET 2026 Cell",
      sourceDept: "AP School Education & APCFSS",
      sourceUrl: "https://www.apteachers.in/2026/08/aptet-response-sheet-calculator-link.html",
      categoryId: toolsCategory.id,
      documentType: "notification",
      tags: ["APTET", "Response Sheet", "Score Calculator", "APCFSS"],
      verifiedAgainstGoir: true,
      isDraft: false,
    },
  });

  // Post 6: APSCERT FA-1 Question Papers & Answer Keys 2026
  await prisma.post.upsert({
    where: { slug: "apscert-fa1-question-papers-answer-keys-2026" },
    update: {
      isDraft: false,
      titleEn: "APSCERT FA-1 / SAMP-1 Question Papers & Official Answer Keys (Classes 1-10)",
      titleTe: "ఎస్సీఈఆర్‌టీ FA-1 / SAMP-1 పరీక్షల ప్రశ్నాపత్రాలు మరియు జవాబు పత్రాలు (1 నుండి 10 తరగతులు)",
      summaryTe: [
        "ఆంధ్రప్రదేశ్ పాఠశాలల్లో 1-10 తరగతులకు నిర్వహించిన FA-1 / CBA-1 పరీక్షల ప్రశ్నాపత్రాలు.",
        "తెలుగు, ఇంగ్లీష్, గణితం, సైన్స్, సోషల్ సబ్జెక్టుల అధికారిక ఆన్సర్ కీస్ PDF డౌన్‌లోడ్.",
        "ప్రాథమిక మరియు ఉన్నత పాఠశాలల ఉపాధ్యాయుల మూల్యాంకనానికి ఉపయోగపడే సమాచారం.",
      ],
      englishAbstract: "Applies to: AP Primary & High School Teachers · Key rule: SCERT Official Formative Assessment (FA-1) key papers",
      statusBadge: "notification",
      actionUrl: "https://www.apteachers.in/2026/08/apscert-fa-1-2026-question-papers-keys.html",
      goReference: "SCERT AP Academic Calendar 2026",
      sourceDept: "APSCERT & State Project Directorate",
      sourceUrl: "https://www.apteachers.in/2026/08/apscert-fa-1-2026-question-papers-keys.html",
      categoryId: circulars.id,
      documentType: "circular",
      tags: ["APSCERT", "FA-1", "Question Papers", "Answer Key"],
      verifiedAgainstGoir: true,
    },
    create: {
      slug: "apscert-fa1-question-papers-answer-keys-2026",
      titleEn: "APSCERT FA-1 / SAMP-1 Question Papers & Official Answer Keys (Classes 1-10)",
      titleTe: "ఎస్సీఈఆర్‌టీ FA-1 / SAMP-1 పరీక్షల ప్రశ్నాపత్రాలు మరియు జవాబు పత్రాలు (1 నుండి 10 తరగతులు)",
      summaryTe: [
        "ఆంధ్రప్రదేశ్ పాఠశాలల్లో 1-10 తరగతులకు నిర్వహించిన FA-1 / CBA-1 పరీక్షల ప్రశ్నాపత్రాలు.",
        "తెలుగు, ఇంగ్లీష్, గణితం, సైన్స్, సోషల్ సబ్జెక్టుల అధికారిక ఆన్సర్ కీస్ PDF డౌన్‌లోడ్.",
        "ప్రాథమిక మరియు ఉన్నత పాఠశాలల ఉపాధ్యాయుల మూల్యాంకనానికి ఉపయోగపడే సమాచారం.",
      ],
      englishAbstract: "Applies to: AP Primary & High School Teachers · Key rule: SCERT Official Formative Assessment (FA-1) key papers",
      statusBadge: "notification",
      actionUrl: "https://www.apteachers.in/2026/08/apscert-fa-1-2026-question-papers-keys.html",
      goReference: "SCERT AP Academic Calendar 2026",
      sourceDept: "APSCERT & State Project Directorate",
      sourceUrl: "https://www.apteachers.in/2026/08/apscert-fa-1-2026-question-papers-keys.html",
      categoryId: circulars.id,
      documentType: "circular",
      tags: ["APSCERT", "FA-1", "Question Papers", "Answer Key"],
      verifiedAgainstGoir: true,
      isDraft: false,
    },
  });


  console.log("Successfully imported latest posts from Amaravathi Teacher to Portal CMS!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
