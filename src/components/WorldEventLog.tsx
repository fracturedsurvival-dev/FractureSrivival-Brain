"use client";
import { useState, useEffect } from 'react';

export default function WorldEventLog() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/world/events/list')
      .then(res => res.json())
      .then(data => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-xs text-cyan-700 animate-pulse">SCANNING_EVENT_LOGS...</div>;

  const getEventColor = (type: string) => {
    switch (type) {
      case 'INVASION': return 'border-red-600 text-red-400';
      case 'RESOURCE': return 'border-cyan-600 text-cyan-400';
      case 'POLITICAL': return 'border-yellow-600 text-yellow-400';
      case 'WEATHER': return 'border-blue-600 text-blue-400';
      default: return 'border-cyan-900 text-cyan-300';
    }
  };

  return (
    <div className="font-mono">
      <h3 className="text-cyan-400 text-sm font-bold mb-2 uppercase">Recent Anomalies</h3>
      {events.length === 0 ? (
        <div className="text-xs text-cyan-800">NO_ANOMALIES_DETECTED</div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-black">
          {events.map(e => {
            const colorClass = getEventColor(e.type);
            return (
              <div key={e.id} className={`border-l-2 pl-3 py-1 ${colorClass.split(' ')[0]} ${e.active ? 'bg-red-900/10' : ''}`}>
                <div className={`font-bold text-xs uppercase ${colorClass.split(' ')[1]}`}>{e.title} <span className="text-[10px] opacity-70">{'//'}{e.type}</span></div>
                <div className="text-xs text-cyan-600 mt-1">{e.description}</div>
                <div className="text-[10px] text-cyan-800 mt-1">{new Date(e.createdAt).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
