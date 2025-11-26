
'use client';

import { useState, useEffect } from 'react';

interface Ingredient {
  itemId: string;
  quantity: number;
  item: {
    name: string;
  };
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  outputQuantity: number;
  outputItem: {
    name: string;
  };
  ingredients: Ingredient[];
}

interface CraftingPanelProps {
  npcId: string;
}

export default function CraftingPanel({ npcId }: CraftingPanelProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [crafting, setCrafting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/craft/recipes');
      const data = await res.json();
      setRecipes(data);
    } catch (error) {
      console.error('Failed to load recipes', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCraft = async (recipeId: string) => {
    setCrafting(recipeId);
    setMessage(null);
    try {
      const res = await fetch('/api/craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, npcId }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`Successfully crafted ${data.result.quantity}x ${data.result.crafted}!`);
      } else {
        setMessage(`Crafting failed: ${data.error}`);
        if (data.missing) {
            const missingText = data.missing.map((m: any) => `${m.item} (Need ${m.required}, Have ${m.have})`).join(', ');
            setMessage(`Missing: ${missingText}`);
        }
      }
    } catch (error) {
      setMessage('An error occurred while crafting.');
    } finally {
      setCrafting(null);
    }
  };

  if (loading) return <div className="p-4 text-cyan-500">Loading schematics...</div>;

  return (
    <div className="bg-black border border-cyan-800 p-4 font-mono text-cyan-500 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 border-b border-cyan-800 pb-2">FABRICATION STATION</h2>
      
      {message && (
        <div className={`mb-4 p-2 border ${message.includes('Success') ? 'border-cyan-500 bg-cyan-900/20' : 'border-red-500 bg-red-900/20'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="border border-cyan-900 p-3 hover:bg-cyan-900/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{recipe.name}</h3>
                <p className="text-sm text-cyan-400/70">{recipe.description}</p>
              </div>
              <button
                onClick={() => handleCraft(recipe.id)}
                disabled={!!crafting}
                className="px-3 py-1 bg-cyan-900 hover:bg-cyan-800 text-cyan-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {crafting === recipe.id ? 'FABRICATING...' : 'CRAFT'}
              </button>
            </div>
            
            <div className="text-xs space-y-1">
              <div className="font-semibold text-cyan-400">REQUIRES:</div>
              <ul className="list-disc list-inside pl-2">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.itemId}>
                    {ing.quantity}x {ing.item.name}
                  </li>
                ))}
              </ul>
              <div className="mt-2 font-semibold text-cyan-400">OUTPUT:</div>
              <div className="pl-2">
                {recipe.outputQuantity}x {recipe.outputItem.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
