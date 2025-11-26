"use client";
import { useEffect, useState } from 'react';

interface NPC { 
  id: string; 
  name: string; 
  faction: string | null; 
  alignment: string | null; 
  health?: number;
  status?: string;
  userId?: string | null;
}

export default function NPCList({ onSelect }: { onSelect: (npc: NPC) => void }) {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNpcs = () => {
    fetch('/api/npc/list')
      .then(r => r.json())
      .then(setNpcs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNpcs();
    // Poll for health updates
    const interval = setInterval(fetchNpcs, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="animate-pulse text-cyan-700">SCANNING_NEURAL_NET...</div>;
  if (error) return <div className="text-red-500">ERROR: {error}</div>;

  return (
    <ul className="space-y-2">
      {npcs.map(n => (
        <li key={n.id} className="relative group">
          <button 
            className="w-full text-left px-2 py-2 bg-black/40 hover:bg-cyan-900/20 transition-all border border-cyan-900/30 hover:border-cyan-500/50 text-sm font-mono" 
            onClick={() => onSelect(n)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`font-bold ${n.status === 'DEAD' ? 'text-red-700 line-through' : 'text-cyan-400'}`}>
                [{n.name}] {n.userId && <span className="text-blue-400 text-[10px] ml-1">[PLAYER]</span>}
              </span>
              <span className="text-cyan-700 text-xs">{'//'}{n.faction ?? 'ROGUE'}</span>
            </div>
            
            {/* Health Bar */}
            <div className="w-full h-1 bg-cyan-900/30 mt-1">
              <div 
                className={`h-full transition-all duration-500 ${
                  (n.health || 100) < 30 ? 'bg-red-500' : 'bg-cyan-500'
                }`} 
                style={{ width: `${n.health || 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-cyan-800 mt-0.5">
              <span>HP: {n.health || 100}%</span>
              <span>STATUS: {n.status || 'ALIVE'}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
