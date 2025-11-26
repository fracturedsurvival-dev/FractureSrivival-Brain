import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // NPCs
  const npcs = [
    { name: 'LUX', faction: 'LUX', alignment: 'Lawful' },
    { name: 'Vera', faction: 'Vera', alignment: 'Chaotic' },
    { name: 'Orion', faction: 'Neutral', alignment: 'Good' },
  ];
  for (const n of npcs) {
    await prisma.nPC.upsert({
      where: { name: n.name },
      update: {},
      create: n,
    });
  }
  // Initial faction lore
  await prisma.textBlob.upsert({
    where: { slug: 'lux_faction' },
    update: {},
    create: {
      category: 'FACTION',
      slug: 'lux_faction',
      content: 'The LUX faction is a rigid, technocratic group prioritizing order and survival above all else. They are suspicious of independent action.'
    }
  });
  console.log('Seed complete');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
