const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.category.findMany({ select: { nameEn: true, icon: true, slug: true } })
  .then(r => console.log(JSON.stringify(r, null, 2)))
  .finally(() => prisma.$disconnect());
