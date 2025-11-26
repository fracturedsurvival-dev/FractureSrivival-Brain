
'use client';

import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
  baseValue: number;
}

interface InventoryItem {
  id: string;
  quantity: number;
  item: Item;
}

interface Trader {
  id: string;
  name: string;
  walletBalance: number;
}

interface GeneralStoreProps {
  userNpcId: string;
  onTransactionComplete: () => void;
}

export default function GeneralStore({ userNpcId, onTransactionComplete }: GeneralStoreProps) {
  const [trader, setTrader] = useState<Trader | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');

  useEffect(() => {
    const fetchTrader = async () => {
      try {
        const res = await fetch('/api/npc/trader');
        const data = await res.json();
        if (data.trader) {
          setTrader(data.trader);
        }
      } catch (error) {
        console.error('Failed to fetch trader', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrader();
  }, []);

  useEffect(() => {
    if (trader) {
      fetchInventory(mode === 'BUY' ? trader.id : userNpcId);
    }
  }, [mode, trader, userNpcId]);

  const fetchInventory = async (targetId: string) => {
    const res = await fetch(`/api/inventory/list?npcId=${targetId}`);
    const data = await res.json();
    if (data.success) {
      setInventory(data.data);
    }
  };

  const handleTransaction = async (item: InventoryItem) => {
    if (!trader) return;
    setProcessing(true);

    const isBuy = mode === 'BUY';
    const buyerId = isBuy ? userNpcId : trader.id;
    const sellerId = isBuy ? trader.id : userNpcId;
    const price = item.item.baseValue;

    try {
      const res = await fetch('/api/economy/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId,
          sellerId,
          itemId: item.item.id,
          quantity: 1,
          price: price
        }),
      });
      
      if (res.ok) {
        fetchInventory(mode === 'BUY' ? trader.id : userNpcId);
        onTransactionComplete();
      } else {
        const err = await res.json();
        alert(err.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Trade failed', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-cyan-500 animate-pulse">LOCATING_TRADER_SIGNAL...</div>;
  if (!trader) return <div className="text-red-500">NO_TRADER_FOUND_IN_SECTOR</div>;

  return (
    <div className="bg-black/90 border border-cyan-900/50 p-4 rounded-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-cyan-900/30 pb-2">
        <h2 className="text-cyan-500 text-xl font-mono">GENERAL_STORE [{trader.name}]</h2>
        <div className="text-xs text-cyan-700">CREDITS: {trader.walletBalance}</div>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setMode('BUY')}
          className={`flex-1 p-2 text-sm font-bold rounded ${mode === 'BUY' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-600' : 'bg-black border border-cyan-900/30 text-gray-500'}`}
        >
          BUY
        </button>
        <button 
          onClick={() => setMode('SELL')}
          className={`flex-1 p-2 text-sm font-bold rounded ${mode === 'SELL' ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-600' : 'bg-black border border-cyan-900/30 text-gray-500'}`}
        >
          SELL
        </button>
      </div>

      <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {inventory.length === 0 ? (
          <div className="text-gray-500 text-center py-4">EMPTY_INVENTORY</div>
        ) : (
          inventory.map((invItem) => (
            <div key={invItem.id} className="flex justify-between items-center p-2 border border-cyan-900/20 bg-cyan-900/5 hover:bg-cyan-900/10 transition-colors rounded">
              <div>
                <div className="text-cyan-400 font-bold">{invItem.item.name}</div>
                <div className="text-xs text-gray-500">{invItem.item.description}</div>
                <div className="text-xs text-cyan-700 mt-1">QTY: {invItem.quantity}</div>
              </div>
              <button
                onClick={() => handleTransaction(invItem)}
                disabled={processing}
                className="bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-500 border border-cyan-700/50 px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {mode === 'BUY' ? 'BUY' : 'SELL'} {invItem.item.baseValue} CR
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
