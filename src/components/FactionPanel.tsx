"use client";
import { useState, useEffect } from 'react';

export default function FactionPanel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [factions, setFactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchFactions = () => {
    fetch('/api/factions/list')
      .then(res => res.json())
      .then(data => {
        setFactions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFactions();
  }, []);

  const [lastAction, setLastAction] = useState<Record<string, string>>({});

  const triggerTurn = async (factionId: string) => {
    setProcessing(factionId);
    try {
      const res = await fetch('/api/factions/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factionId })
      });
      const data = await res.json();
      if (data.success) {
        setLastAction(prev => ({ ...prev, [factionId]: `${data.data.action}: ${data.data.reasoning}` }));
      }
      fetchFactions(); // Refresh data
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="text-xs text-cyan-700 animate-pulse">DECRYPTING_FACTION_DATA...</div>;

  return (
    <div className="font-mono">
      {factions.length === 0 ? (
        <div className="text-xs text-cyan-800">NO_FACTIONS_DETECTED</div>
      ) : (
        <div className="space-y-4">
          {factions.map(f => (
            <div key={f.id} className="border border-cyan-900/50 p-2 bg-black/40">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-cyan-400 text-sm uppercase tracking-wider">{f.name}</div>
                  <div className="text-[10px] text-cyan-500 mt-0.5">RES: {f.resources || 0} {'//'} OPS: {f.members?.length || 0}</div>
                </div>
                <button 
                  onClick={() => triggerTurn(f.id)}
                  disabled={!!processing}
                  className="text-[10px] border border-cyan-800 px-2 py-1 hover:bg-cyan-900/30 disabled:opacity-50"
                >
                  {processing === f.id ? 'CALCULATING...' : 'EXECUTE_TURN'}
                </button>
              </div>
              
              <div className="text-xs text-cyan-600 mt-2 italic border-l-2 border-cyan-900 pl-2">
                &quot;{f.goals || 'Survive.'}&quot;
              </div>
              
              {lastAction[f.id] && (
                <div className="mt-2 text-[10px] text-blue-400 border-t border-cyan-900/30 pt-1">
                  LAST_OP: {lastAction[f.id]}
                </div>
              )}
              
              <div className="text-[10px] text-cyan-800 mt-2">{f.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
