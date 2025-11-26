
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.nPC.count();
  console.log(`Total NPCs: ${count}`);
  const npcs = await prisma.nPC.findMany({ take: 5 });
  console.log(JSON.stringify(npcs, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
