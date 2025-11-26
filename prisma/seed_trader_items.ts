
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Trader Inventory...');

  const trader = await prisma.nPC.findFirst({ where: { job: 'TRADER' } });
  if (!trader) {
    console.log('No Trader found. Run seed_jobs.ts first.');
    return;
  }

  // Ensure basic items exist
  const basicItems = [
    { name: 'Medkit', description: 'Standard issue medical kit.', type: 'CONSUMABLE', value: 50.0 },
    { name: 'Ration Pack', description: 'Nutrient dense food bar.', type: 'CONSUMABLE', value: 10.0 },
    { name: 'Clean Water', description: 'Purified H2O.', type: 'CONSUMABLE', value: 15.0 },
  ];

  for (const item of basicItems) {
    await prisma.item.upsert({
      where: { name: item.name },
      update: { ...item },
      create: { ...item }
    });
  }

  // Get all items
  const allItems = await prisma.item.findMany();

  // Give trader random stock of everything
  for (const item of allItems) {
    const quantity = Math.floor(Math.random() * 50) + 10; // 10 to 60 items
    
    await prisma.inventoryItem.upsert({
      where: {
        npcId_itemId: {
          npcId: trader.id,
          itemId: item.id
        }
      },
      update: { quantity },
      create: {
        npcId: trader.id,
        itemId: item.id,
        quantity
      }
    });
  }

  console.log(`Stocked Trader ${trader.name} with ${allItems.length} types of items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
