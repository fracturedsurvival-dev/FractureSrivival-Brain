"use client";
import { useEffect, useState } from 'react';

interface Memory { id: string; npcId: string; summary: string | null; createdAt: string; importance?: number; tags?: string; }

export default function MemoryList({ npcId }: { npcId: string | null }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!npcId) return;
    let mounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/memory/list?npcId=${npcId}`);
        const data = await res.json();
        if (mounted) setMemories(data);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [npcId]);

  if (!npcId) return <div className="text-xs text-green-800">AWAITING_TARGET_SELECTION...</div>;
  if (loading) return <div className="text-xs text-green-700 animate-pulse">ACCESSING_MEMORY_BANKS...</div>;

  return (
    <div className="font-mono text-xs">
      {memories.length === 0 && <div className="text-green-800">MEMORY_BANKS_EMPTY</div>}
      <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black">
        {memories.map(m => (
          <li key={m.id} className="border-b border-green-900/30 pb-2 last:border-0">
            <div className="text-green-400 mb-1">{m.summary ?? '(DATA_CORRUPTED)'}</div>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-green-800">[{new Date(m.createdAt).toLocaleString()}]</span>
              {m.importance && <span className="text-yellow-600 border border-yellow-900/30 px-1">IMP:{m.importance}</span>}
              {m.tags && <span className="text-blue-500 border border-blue-900/30 px-1">{m.tags}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
