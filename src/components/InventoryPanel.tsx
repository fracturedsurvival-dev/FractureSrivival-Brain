'use client';

import { useState, useEffect } from 'react';

interface InventoryItem {
  id: string;
  item: {
    id: string;
    name: string;
    type: string;
    description: string;
    stats: any;
  };
  quantity: number;
  equipped: boolean;
}

export default function InventoryPanel({ selectedNpcId, userId }: { selectedNpcId: string | null, userId?: string }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = async () => {
    if (!selectedNpcId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/list?npcId=${selectedNpcId}`, {
        headers: { 'x-user-id': userId || 'user_123' } // Mock auth
      });
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedNpcId]);

  const toggleEquip = async (itemId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/inventory/equip', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId || 'user_123'
        },
        body: JSON.stringify({ itemId, equip: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sellItem = async (itemId: string) => {
    const price = prompt("Enter price in Credits:");
    if (!price || isNaN(Number(price))) return;

    try {
      const res = await fetch('/api/economy/market', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId || 'user_123'
        },
        body: JSON.stringify({ 
            itemId, 
            quantity: 1, 
            price: Number(price),
            npcId: selectedNpcId
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchInventory();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!selectedNpcId) return null;

  return (
    <div className="border border-cyan-900/50 bg-black/90 p-4 font-mono text-cyan-500 shadow-[0_0_10px_rgba(0,240,255,0.1)] mt-4">
      <div className="flex justify-between items-center mb-4 border-b border-cyan-900 pb-2">
        <h2 className="text-xl font-bold tracking-wider text-cyan-400">
          [ INVENTORY_MANIFEST ]
        </h2>
        <button onClick={fetchInventory} className="text-xs hover:text-cyan-300">[REFRESH]</button>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
        {inventory.length === 0 ? (
          <div className="text-center text-cyan-800 py-4">EMPTY_STORAGE</div>
        ) : (
          inventory.map((slot) => (
            <div key={slot.id} className={`flex justify-between items-center border p-2 transition-colors ${slot.equipped ? 'border-cyan-500 bg-cyan-900/20' : 'border-cyan-900/30 hover:bg-cyan-900/10'}`}>
              <div>
                <div className="font-bold text-cyan-400 flex items-center gap-2">
                  {slot.item.name}
                  {slot.equipped && <span className="text-[10px] bg-cyan-500 text-black px-1 rounded">EQUIPPED</span>}
                </div>
                <div className="text-xs text-cyan-600">{slot.item.type} | Qty: {slot.quantity}</div>
                {slot.item.stats && (
                  <div className="text-xs text-cyan-700 font-mono">
                    {Object.entries(slot.item.stats).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(' | ')}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                {(slot.item.type === 'WEAPON' || slot.item.type === 'ARMOR') && (
                  <button
                    onClick={() => toggleEquip(slot.item.id, slot.equipped)}
                    className={`text-xs px-2 py-1 rounded border ${slot.equipped ? 'border-red-900 text-red-400 hover:bg-red-900/20' : 'border-cyan-800 text-cyan-400 hover:bg-cyan-900/30'}`}
                  >
                    {slot.equipped ? '[UNEQUIP]' : '[EQUIP]'}
                  </button>
                )}
                {!slot.equipped && (
                  <button
                    onClick={() => sellItem(slot.item.id)}
                    className="text-xs px-2 py-1 rounded border border-yellow-900 text-yellow-500 hover:bg-yellow-900/20"
                  >
                    [SELL]
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
