
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { recipeId, npcId } = await request.json();

    if (!recipeId || !npcId) {
      return NextResponse.json({ error: 'Missing recipeId or npcId' }, { status: 400 });
    }

    // 1. Fetch Recipe with ingredients
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: { item: true }
        },
        outputItem: true
      }
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // 2. Check NPC Inventory
    const npcInventory = await prisma.inventoryItem.findMany({
      where: { npcId },
      include: { item: true }
    });

    // Map inventory for easy lookup
    const inventoryMap = new Map<string, number>();
    for (const invItem of npcInventory) {
      inventoryMap.set(invItem.itemId, invItem.quantity);
    }

    // 3. Verify Ingredients
    const missingIngredients = [];
    for (const ingredient of recipe.ingredients) {
      const currentQty = inventoryMap.get(ingredient.itemId) || 0;
      if (currentQty < ingredient.quantity) {
        missingIngredients.push({
          item: ingredient.item.name,
          required: ingredient.quantity,
          have: currentQty
        });
      }
    }

    if (missingIngredients.length > 0) {
      return NextResponse.json({
        error: 'Insufficient ingredients',
        missing: missingIngredients
      }, { status: 400 });
    }

    // 4. Execute Crafting (Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Deduct ingredients
      for (const ingredient of recipe.ingredients) {
        await tx.inventoryItem.updateMany({
          where: {
            npcId,
            itemId: ingredient.itemId
          },
          data: {
            quantity: { decrement: ingredient.quantity }
          }
        });
        
        // Cleanup empty inventory items
        await tx.inventoryItem.deleteMany({
            where: {
                npcId,
                itemId: ingredient.itemId,
                quantity: { lte: 0 }
            }
        });
      }

      // Add output item
      const existingOutput = await tx.inventoryItem.findUnique({
        where: {
          npcId_itemId: {
            npcId,
            itemId: recipe.outputItemId
          }
        }
      });

      if (existingOutput) {
        await tx.inventoryItem.update({
          where: { id: existingOutput.id },
          data: { quantity: { increment: recipe.outputQuantity } }
        });
      } else {
        await tx.inventoryItem.create({
          data: {
            npcId,
            itemId: recipe.outputItemId,
            quantity: recipe.outputQuantity
          }
        });
      }

      return {
        crafted: recipe.outputItem.name,
        quantity: recipe.outputQuantity
      };
    });

    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error('Crafting error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
