'use client';

import { useState, useEffect } from 'react';

interface MarketListing {
  id: string;
  item: {
    name: string;
    type: string;
    description: string;
    value: number;
  };
  price: number;
  quantity: number;
  seller: {
    name: string;
  };
}

export default function MarketTerminal({ selectedNpcId }: { selectedNpcId: string | null }) {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/economy/market');
      const data = await res.json();
      if (data.success) {
        setListings(data.data);
      }
    } catch {
      setMessage("ERROR: CONNECTION_LOST");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const buyItem = async (listingId: string, price: number) => {
    if (!selectedNpcId) return;
    setMessage("PROCESSING_TRANSACTION...");
    try {
      const res = await fetch('/api/economy/market/buy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': 'user_123' // Mock user ID for now, ideally from auth context
        },
        body: JSON.stringify({ listingId, quantity: 1 })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`ACQUIRED: ITEM_ID [${listingId.slice(-4)}]`);
        fetchListings(); // Refresh
      } else {
        setMessage(`ERROR: ${data.error}`);
      }
    } catch {
      setMessage("TRANSACTION_FAILED");
    }
  };

  return (
    <div className="border border-cyan-900/50 bg-black/90 p-4 font-mono text-cyan-500 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
      <div className="flex justify-between items-center mb-4 border-b border-cyan-900 pb-2">
        <h2 className="text-xl font-bold tracking-wider text-cyan-400">
          [ BLACK_MARKET_NET ]
        </h2>
        <button onClick={fetchListings} className="text-xs hover:text-cyan-300">[REFRESH]</button>
      </div>

      {message && (
        <div className="mb-4 p-2 bg-cyan-900/20 border border-cyan-800 text-xs text-cyan-300">
          {`> ${message}`}
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {listings.length === 0 ? (
          <div className="text-center text-cyan-800 py-4">NO_ACTIVE_LISTINGS</div>
        ) : (
          listings.map((listing) => (
            <div key={listing.id} className="flex justify-between items-center border border-cyan-900/30 p-2 hover:bg-cyan-900/10 transition-colors">
              <div>
                <div className="font-bold text-cyan-400">{listing.item.name}</div>
                <div className="text-xs text-cyan-600">{listing.item.type} | Seller: {listing.seller.name}</div>
                <div className="text-xs text-cyan-700 italic">{listing.item.description}</div>
              </div>
              <div className="text-right">
                <div className="text-lg text-cyan-300">{listing.price} CR</div>
                <button
                  onClick={() => buyItem(listing.id, listing.price)}
                  disabled={!selectedNpcId || loading}
                  className="mt-1 text-xs bg-cyan-900/30 hover:bg-cyan-900/60 px-2 py-1 rounded border border-cyan-800 disabled:opacity-30"
                >
                  [BUY]
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
