"use client";
import { useEffect, useState } from 'react';

interface TrustState { id: string; sourceId: string; targetId: string; trustLevel: number; updatedAt: string; }

export default function NPCTrustPanel({ sourceId }: { sourceId: string | null }) {
  const [states, setStates] = useState<TrustState[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sourceId) return;
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/trust/state?sourceId=${sourceId}`);
        const data = await res.json();
        if (mounted) setStates(data);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [sourceId]);

  if (!sourceId) return <div className="text-xs text-cyan-800">AWAITING_TARGET_SELECTION...</div>;
  if (loading) return <div className="text-xs text-cyan-700 animate-pulse">CALCULATING_TRUST_VECTORS...</div>;

  return (
    <div className="font-mono text-xs">
      {states.length === 0 && <div className="text-cyan-800">NO_TRUST_DATA_AVAILABLE</div>}
      <ul className="space-y-2">
        {states.map(s => (
          <li key={s.id} className="flex items-center justify-between border-b border-cyan-900/30 pb-1">
            <span className="text-cyan-500">{s.targetId}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-cyan-900/30 border border-cyan-900">
                <div 
                  className={`h-full ${s.trustLevel < 0 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                  style={{ width: `${Math.min(100, Math.abs(s.trustLevel))}%` }}
                />
              </div>
              <span className={s.trustLevel < 0 ? 'text-red-500' : 'text-cyan-400'}>{s.trustLevel}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
