import prisma from '@/lib/db';

async function main() {
  console.log('Seeding Items...');

  const items = [
    { name: 'Rusty Knife', description: 'Better than nothing.', type: 'WEAPON', value: 15.0, stats: { damage: 5 } },
    { name: 'Laser Pistol', description: 'Old tech, but reliable.', type: 'WEAPON', value: 150.0, stats: { damage: 25 } },
    { name: 'Scrap Armor', description: 'Plates of metal wired together.', type: 'ARMOR', value: 50.0, stats: { defense: 10 } },
    { name: 'Medkit', description: 'Basic first aid supplies.', type: 'CONSUMABLE', value: 25.0, stats: { heal: 30 } },
    { name: 'Water Ration', description: 'Clean water is scarce.', type: 'RESOURCE', value: 5.0, stats: {} },
    { name: 'Scrap Metal', description: 'Useful for crafting.', type: 'RESOURCE', value: 2.0, stats: {} },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { name: item.name },
      update: {},
      create: item
    });
  }

  console.log('Items seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
