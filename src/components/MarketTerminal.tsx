'use client';

import { useState } from 'react';

interface MarketItem {
  name: string;
  cost: number;
  benefit: string;
}

const MARKET_ITEMS: MarketItem[] = [
  { name: "Ration Pack", cost: 15, benefit: "Survival" },
  { name: "Data Cache", cost: 50, benefit: "Intel" },
  { name: "Weapon Parts", cost: 100, benefit: "Defense" },
  { name: "Bribe", cost: 30, benefit: "Influence" }
];

export default function MarketTerminal({ selectedNpcId }: { selectedNpcId: string | null }) {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const evaluateMarket = async () => {
    if (!selectedNpcId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/economy/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npcId: selectedNpcId })
      });
      const data = await res.json();
      setLastAction(JSON.stringify(data, null, 2));
    } catch {
      setLastAction("Error connecting to market.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-green-900/50 bg-black/90 p-4 font-mono text-green-500 shadow-[0_0_10px_rgba(0,255,0,0.1)]">
      <h2 className="mb-4 text-xl font-bold tracking-wider text-green-400 border-b border-green-900 pb-2">
        [ BLACK_MARKET_ACCESS ]
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <h3 className="text-xs text-green-600 uppercase">Available Contracts</h3>
          <ul className="space-y-1 text-sm">
            {MARKET_ITEMS.map((item) => (
              <li key={item.name} className="flex justify-between border-b border-green-900/30 pb-1">
                <span>{item.name}</span>
                <span className="text-green-300">{item.cost} CR</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs text-green-600 uppercase">AI Trader</h3>
          <div className="h-24 bg-black border border-green-900 p-2 text-xs overflow-auto whitespace-pre-wrap">
            {loading ? "ANALYZING_MARKET_CONDITIONS..." : lastAction || "WAITING_FOR_INPUT..."}
          </div>
          <button
            onClick={evaluateMarket}
            disabled={!selectedNpcId || loading}
            className="w-full bg-green-900/20 hover:bg-green-900/40 text-green-400 border border-green-700 px-3 py-2 text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "NEGOTIATING..." : "EVALUATE PURCHASE"}
          </button>
        </div>
      </div>
    </div>
  );
}
