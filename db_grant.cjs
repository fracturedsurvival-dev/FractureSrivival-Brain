
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the user associated with ShadedAir
  const npc = await prisma.nPC.findUnique({
    where: { name: 'ShadedAir' },
    include: { user: true }
  });

  if (npc && npc.user) {
    console.log(`Found user for ShadedAir: ${npc.user.email}`);
    await prisma.user.update({
      where: { id: npc.user.id },
      data: { role: 'ADMIN' }
    });
    console.log('Updated role to ADMIN');
  } else {
    console.log('ShadedAir user not found');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
