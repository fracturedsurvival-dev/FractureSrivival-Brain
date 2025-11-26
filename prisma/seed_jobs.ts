
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Jobs...');

  // We don't need to seed the enum, but we can update existing NPCs to have a default job if needed.
  // For now, let's just ensure the DB is happy.
  
  // Let's create a "Trader" NPC if one doesn't exist, to act as the "General Store" owner.
  const traderName = "Trader Joe";
  
  const existingTrader = await prisma.nPC.findUnique({ where: { name: traderName } });
  
  if (!existingTrader) {
    await prisma.nPC.create({
      data: {
        name: traderName,
        faction: "Independent",
        alignment: "Neutral",
        job: "TRADER",
        status: "ALIVE",
        wallet: {
            create: {
                address: "trader_joe_wallet_" + Math.random().toString(36).substring(7),
                balance: 5000.0
            }
        }
      }
    });
    console.log("Created Trader Joe");
  } else {
    console.log("Trader Joe already exists");
  }

  console.log('Jobs seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
