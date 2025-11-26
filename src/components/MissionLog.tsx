'use client';

import { useState, useEffect } from 'react';

interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'FAILED';
  rewards: { credits?: number, itemId?: string };
  giver: { name: string };
  receiver: { name: string };
  startedAt?: string;
  duration: number;
}

const MissionCard = ({ mission, onResponse }: { mission: Mission, onResponse: (id: string, action: 'ACCEPTED' | 'DECLINED' | 'COMPLETED') => void }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (mission.status !== 'ACCEPTED' || !mission.startedAt) {
      if (mission.status === 'COMPLETED') setProgress(100);
      return;
    }

    const start = new Date(mission.startedAt).getTime();
    const durationMs = mission.duration * 1000;
    
    const update = () => {
      const now = Date.now();
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);
      
      if (pct >= 100) {
        setIsReady(true);
      } else {
        requestAnimationFrame(update);
      }
    };
    
    update();
  }, [mission]);

  return (
    <div className="border border-cyan-900/30 p-3 hover:bg-cyan-900/10 transition-colors">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-cyan-400">{mission.title}</h3>
        <span className={`text-[10px] px-1 rounded ${mission.status === 'COMPLETED' ? 'bg-cyan-500 text-black' : 'bg-cyan-900 text-cyan-300'}`}>
          {mission.status}
        </span>
      </div>
      <p className="text-xs text-cyan-600 mt-1">{mission.description}</p>
      
      {mission.status === 'ACCEPTED' && (
        <div className="w-full bg-cyan-900/30 h-1 mt-2 mb-1">
          <div 
            className="bg-cyan-500 h-full transition-all duration-100 ease-linear" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex justify-between items-end mt-2">
        <div className="text-xs text-cyan-700">
          <div>From: {mission.giver.name}</div>
          <div>Rewards: {mission.rewards?.credits ? `${mission.rewards.credits} CR` : ''} {mission.rewards?.itemId ? `+ ITEM` : ''}</div>
        </div>
        
        <div className="flex gap-2">
          {mission.status === 'PENDING' && (
            <>
              <button onClick={() => onResponse(mission.id, 'ACCEPTED')} className="text-xs border border-cyan-600 text-cyan-400 px-2 py-1 hover:bg-cyan-900/50">[ACCEPT]</button>
              <button onClick={() => onResponse(mission.id, 'DECLINED')} className="text-xs border border-red-900 text-red-500 px-2 py-1 hover:bg-red-900/20">[DECLINE]</button>
            </>
          )}
          {mission.status === 'ACCEPTED' && (
            <button 
              onClick={() => onResponse(mission.id, 'COMPLETED')} 
              disabled={!isReady}
              className={`text-xs border px-2 py-1 transition-colors ${isReady ? 'border-cyan-500 text-cyan-300 hover:bg-cyan-900/50 bg-cyan-900/20 animate-pulse' : 'border-cyan-900 text-cyan-800 cursor-not-allowed'}`}
            >
              {isReady ? '[CLAIM REWARD]' : `[IN PROGRESS ${Math.floor(progress)}%]`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MissionLog({ npcId }: { npcId: string | null }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ACTIVE' | 'PENDING' | 'HISTORY'>('ACTIVE');

  const fetchMissions = async () => {
    if (!npcId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/missions/list?npcId=${npcId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMissions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [npcId]);

  const handleResponse = async (missionId: string, response: 'ACCEPTED' | 'DECLINED' | 'COMPLETED') => {
    try {
      const res = await fetch('/api/missions/respond', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': 'user_123' // Mock
        },
        body: JSON.stringify({ missionId, response })
      });
      const data = await res.json();
      if (data.success) {
        fetchMissions();
      } else {
        alert(`Action Failed: ${data.error || 'Unknown Error'}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMissions = missions.filter(m => {
    if (filter === 'PENDING') return m.status === 'PENDING';
    if (filter === 'ACTIVE') return m.status === 'ACCEPTED';
    if (filter === 'HISTORY') return ['COMPLETED', 'DECLINED', 'FAILED'].includes(m.status);
    return false;
  });

  if (!npcId) return null;

  return (
    <div className="border border-cyan-900/50 bg-black/90 p-4 font-mono text-cyan-500 shadow-[0_0_10px_rgba(0,240,255,0.1)] mt-4">
      <div className="flex justify-between items-center mb-4 border-b border-cyan-900 pb-2">
        <h2 className="text-xl font-bold tracking-wider text-cyan-400">
          [ MISSION_LOG ]
        </h2>
        <button onClick={fetchMissions} className="text-xs hover:text-cyan-300">[REFRESH]</button>
      </div>

      <div className="flex gap-2 mb-4 text-xs">
        {['ACTIVE', 'PENDING', 'HISTORY'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 border ${filter === f ? 'border-cyan-500 bg-cyan-900/30 text-cyan-300' : 'border-cyan-900 text-cyan-700 hover:text-cyan-500'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
        {filteredMissions.length === 0 ? (
          <div className="text-center text-cyan-800 py-4">NO_DATA_FOUND</div>
        ) : (
          filteredMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} onResponse={handleResponse} />
          ))
        )}
      </div>
    </div>
  );
}
