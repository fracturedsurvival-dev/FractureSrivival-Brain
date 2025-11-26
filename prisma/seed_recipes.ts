
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Recipes...');

  // 1. Ensure Ingredients exist
  const ingredients = [
    { name: 'Bandage', description: 'Simple cloth for binding wounds.', type: 'RESOURCE', value: 5.0 },
    { name: 'Antiseptic', description: 'Prevents infection.', type: 'RESOURCE', value: 10.0 },
    { name: 'Weapon Parts', description: 'Internal mechanisms for weapons.', type: 'RESOURCE', value: 20.0 },
    { name: 'Scrap Metal', description: 'Useful for crafting.', type: 'RESOURCE', value: 2.0 }, // Ensure it exists
  ];

  for (const item of ingredients) {
    await prisma.item.upsert({
      where: { name: item.name },
      update: {},
      create: item
    });
  }

  // 2. Ensure Output Items exist (if not already)
  const outputs = [
    { name: 'Medkit', description: 'Basic first aid supplies.', type: 'CONSUMABLE', value: 25.0, stats: { heal: 30 } },
    { name: 'Scrap Armor', description: 'Plates of metal wired together.', type: 'ARMOR', value: 50.0, stats: { defense: 10 } },
    { name: 'Rusty Knife', description: 'Better than nothing.', type: 'WEAPON', value: 15.0, stats: { damage: 5 } },
  ];

  for (const item of outputs) {
    await prisma.item.upsert({
      where: { name: item.name },
      update: {},
      create: item
    });
  }

  // 3. Define Recipes
  const recipes = [
    {
      name: 'Craft Medkit',
      description: 'Combine basic medical supplies.',
      outputItemName: 'Medkit',
      outputQuantity: 1,
      ingredients: [
        { itemName: 'Bandage', quantity: 1 },
        { itemName: 'Antiseptic', quantity: 1 },
      ]
    },
    {
      name: 'Craft Scrap Armor',
      description: 'Cobble together some protection.',
      outputItemName: 'Scrap Armor',
      outputQuantity: 1,
      ingredients: [
        { itemName: 'Scrap Metal', quantity: 5 },
      ]
    },
    {
      name: 'Craft Rusty Knife',
      description: 'Sharpen some scrap and add a handle.',
      outputItemName: 'Rusty Knife',
      outputQuantity: 1,
      ingredients: [
        { itemName: 'Scrap Metal', quantity: 2 },
        { itemName: 'Weapon Parts', quantity: 1 },
      ]
    }
  ];

  for (const recipe of recipes) {
    // Find output item
    const outputItem = await prisma.item.findUnique({ where: { name: recipe.outputItemName } });
    if (!outputItem) {
      console.error(`Output item ${recipe.outputItemName} not found!`);
      continue;
    }

    // Create Recipe
    // We use upsert to avoid duplicates, but Recipe doesn't have a unique name constraint by default.
    // We'll check if it exists by name first.
    const existingRecipe = await prisma.recipe.findFirst({ where: { name: recipe.name } });

    if (!existingRecipe) {
      await prisma.recipe.create({
        data: {
          name: recipe.name,
          description: recipe.description,
          outputItemId: outputItem.id,
          outputQuantity: recipe.outputQuantity,
          ingredients: {
            create: await Promise.all(recipe.ingredients.map(async (ing) => {
              const item = await prisma.item.findUnique({ where: { name: ing.itemName } });
              if (!item) throw new Error(`Ingredient ${ing.itemName} not found`);
              return {
                itemId: item.id,
                quantity: ing.quantity
              };
            }))
          }
        }
      });
      console.log(`Created recipe: ${recipe.name}`);
    } else {
      console.log(`Recipe ${recipe.name} already exists.`);
    }
  }

  console.log('Recipes seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
