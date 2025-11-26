"use client";

import React, { useState } from 'react';

export default function GodModePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  // NPC Form
  const [npcName, setNpcName] = useState('');
  const [npcFaction, setNpcFaction] = useState('');
  const [npcAlignment, setNpcAlignment] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execute = async (url: string, body: any) => {
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (e) {
      setOutput(`ERROR: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-900/80 text-red-500 border border-red-500 px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-red-900 transition-all z-50"
      >
        Initialize Root Access
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-2xl border-2 border-red-600 bg-black p-6 shadow-[0_0_20px_rgba(220,38,38,0.3)] relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 text-red-600 hover:text-red-400"
        >
          [X] TERMINATE
        </button>

        <h2 className="text-2xl font-bold text-red-600 mb-6 border-b border-red-900 pb-2">
          ROOT_ACCESS // GOD_MODE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spawn NPC */}
          <div className="space-y-4 border border-red-900/50 p-4">
            <h3 className="text-red-400 font-bold uppercase">Spawn Entity</h3>
            <input 
              className="w-full bg-black border border-red-800 text-red-500 px-2 py-1 text-sm"
              placeholder="Entity Name"
              value={npcName}
              onChange={e => setNpcName(e.target.value)}
            />
            <input 
              className="w-full bg-black border border-red-800 text-red-500 px-2 py-1 text-sm"
              placeholder="Faction (Optional)"
              value={npcFaction}
              onChange={e => setNpcFaction(e.target.value)}
            />
            <input 
              className="w-full bg-black border border-red-800 text-red-500 px-2 py-1 text-sm"
              placeholder="Alignment (e.g. Chaotic)"
              value={npcAlignment}
              onChange={e => setNpcAlignment(e.target.value)}
            />
            <button 
              onClick={() => execute('/api/npc/create', { name: npcName, faction: npcFaction, alignment: npcAlignment })}
              className="w-full bg-red-900/20 border border-red-600 text-red-500 py-1 hover:bg-red-900/50 uppercase text-xs"
            >
              Materialize Entity
            </button>
          </div>

          {/* Global Resets */}
          <div className="space-y-4 border border-red-900/50 p-4">
            <h3 className="text-red-400 font-bold uppercase">Global Overrides</h3>
            
            <button 
              onClick={() => execute('/api/admin/reset', { action: 'WIPE_MEMORIES' })}
              className="w-full border border-red-800 text-red-500 py-2 hover:bg-red-900/30 text-xs uppercase text-left px-4 flex justify-between"
            >
              <span>Purge Memory Banks</span>
              <span className="text-red-800">WARNING</span>
            </button>

            <button 
              onClick={() => execute('/api/admin/reset', { action: 'WIPE_TRUST' })}
              className="w-full border border-red-800 text-red-500 py-2 hover:bg-red-900/30 text-xs uppercase text-left px-4 flex justify-between"
            >
              <span>Reset Trust Matrix</span>
              <span className="text-red-800">WARNING</span>
            </button>

            <button 
              onClick={() => execute('/api/admin/reset', { action: 'RESET_WORLD' })}
              className="w-full border border-red-800 text-red-500 py-2 hover:bg-red-900/30 text-xs uppercase text-left px-4 flex justify-between"
            >
              <span>Clear World Events</span>
              <span className="text-red-800">SAFE</span>
            </button>
          </div>
        </div>

        {/* Output Console */}
        <div className="mt-6 border border-red-900 bg-black p-2 h-32 overflow-y-auto">
          <div className="text-xs text-red-800 mb-1">SYSTEM_OUTPUT_LOG:</div>
          {loading && <div className="text-red-500 animate-pulse">EXECUTING_COMMAND...</div>}
          {output && <pre className="text-xs text-red-400 whitespace-pre-wrap">{output}</pre>}
        </div>
      </div>
    </div>
  );
}
