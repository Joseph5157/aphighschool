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
