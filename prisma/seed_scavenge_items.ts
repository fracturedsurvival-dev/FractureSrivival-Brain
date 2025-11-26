
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Scavenge Items...');

  const items = [
    // Tier 1: Common
    { name: 'Bio-Sludge Canister', description: 'Processed organic waste. Edible, barely.', type: 'RESOURCE', value: 2.0, stats: { tier: 1 } },
    { name: 'Dormant Circuit', description: 'Old chip, might still work.', type: 'RESOURCE', value: 5.0, stats: { tier: 1 } },
    { name: 'Scrap Polymer', description: 'Hardened plastic shards.', type: 'RESOURCE', value: 3.0, stats: { tier: 1 } },
    { name: 'Rusty Bolt', description: 'Oxidized fastener.', type: 'RESOURCE', value: 1.0, stats: { tier: 1 } },

    // Tier 2: Uncommon
    { name: 'Isotope Vial', description: 'Faintly glowing liquid.', type: 'RESOURCE', value: 25.0, stats: { tier: 2 } },
    { name: 'Memory Shard', description: 'Crystal storage medium.', type: 'RESOURCE', value: 30.0, stats: { tier: 2 } },
    { name: 'Hydraulic Actuator', description: 'Heavy duty piston.', type: 'RESOURCE', value: 20.0, stats: { tier: 2 } },
    { name: 'Optic Lens', description: 'Precision glass.', type: 'RESOURCE', value: 15.0, stats: { tier: 2 } },

    // Tier 3: Rare
    { name: 'Quantum Processor', description: 'Computing power from the old world.', type: 'RESOURCE', value: 150.0, stats: { tier: 3 } },
    { name: 'Void Essence', description: 'Dark matter containment unit.', type: 'RESOURCE', value: 200.0, stats: { tier: 3 } },
    { name: 'Neural Interface', description: 'Direct brain-computer link.', type: 'RESOURCE', value: 120.0, stats: { tier: 3 } },
    { name: 'Plasma Cell', description: 'High energy battery.', type: 'RESOURCE', value: 100.0, stats: { tier: 3 } },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { name: item.name },
      update: { ...item },
      create: { ...item }
    });
  }

  console.log('Scavenge Items seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
