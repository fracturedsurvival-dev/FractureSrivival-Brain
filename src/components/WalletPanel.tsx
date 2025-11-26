"use client";

import React, { useState, useEffect, useCallback } from 'react';

export default function WalletPanel({ npcId }: { npcId?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const url = npcId ? `/api/wallet/info?ownerId=${npcId}` : '/api/wallet/info';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        // If no npcId, just show the first one or a list (for now just first)
        setWallet(data[0]);
      } else {
        setWallet(data.error ? null : data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [npcId]);

  const createWallet = async () => {
    setLoading(true);
    await fetch('/api/wallet/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId: npcId })
    });
    fetchWallet();
  };

  const transfer = async () => {
    if (!wallet) return;
    setLoading(true);
    await fetch('/api/wallet/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAddress: wallet.address,
        toAddress: recipient,
        amount: parseFloat(transferAmount)
      })
    });
    setTransferAmount('');
    fetchWallet();
  };

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (loading && !wallet) return <div className="text-xs text-green-700 animate-pulse">ACCESSING_BLOCKCHAIN...</div>;

  if (!wallet) {
    return (
      <div className="border-terminal p-4 bg-black/50 mb-6">
        <div className="text-xs text-green-800 mb-2">NO_WALLET_DETECTED</div>
        <button 
          onClick={createWallet}
          className="border border-green-600 text-green-500 px-3 py-1 text-xs hover:bg-green-900/30 uppercase"
        >
          Initialize Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="border-terminal p-4 bg-black/50 mb-6 font-mono">
      <div className="flex justify-between items-center border-b border-green-900 pb-2 mb-2">
        <h2 className="text-green-400 font-bold text-sm uppercase">CRYPTO_WALLET // {wallet.owner?.name || 'UNKNOWN'}</h2>
        <span className="text-xs text-green-600">{wallet.address.substr(0, 6)}...{wallet.address.substr(-4)}</span>
      </div>

      <div className="mb-4">
        <div className="text-xs text-green-800 uppercase">Current Balance</div>
        <div className="text-2xl text-green-400 font-bold">{wallet.balance.toFixed(2)} <span className="text-sm text-green-700">CREDITS</span></div>
      </div>

      <div className="space-y-2 border-t border-green-900/30 pt-2">
        <div className="text-xs text-green-700 uppercase">Transfer Funds</div>
        <input 
          className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 text-xs mb-1"
          placeholder="Recipient Address (0x...)"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
        />
        <div className="flex gap-2">
          <input 
            className="w-1/2 bg-black border border-green-800 text-green-500 px-2 py-1 text-xs"
            placeholder="Amount"
            type="number"
            value={transferAmount}
            onChange={e => setTransferAmount(e.target.value)}
          />
          <button 
            onClick={transfer}
            disabled={loading || !recipient || !transferAmount}
            className="w-1/2 border border-green-600 text-green-500 hover:bg-green-900/30 text-xs uppercase disabled:opacity-30"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}
