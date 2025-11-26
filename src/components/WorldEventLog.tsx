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

  if (loading) return <div className="text-xs text-green-700 animate-pulse">SCANNING_EVENT_LOGS...</div>;

  return (
    <div className="font-mono">
      <h3 className="text-green-400 text-sm font-bold mb-2 uppercase">Recent Anomalies</h3>
      {events.length === 0 ? (
        <div className="text-xs text-green-800">NO_ANOMALIES_DETECTED</div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black">
          {events.map(e => (
            <div key={e.id} className={`border-l-2 pl-3 py-1 ${e.active ? 'border-red-500' : 'border-green-900'}`}>
              <div className="font-bold text-xs text-green-300 uppercase">{e.title} <span className="text-[10px] text-green-700">{'//'}{e.type}</span></div>
              <div className="text-xs text-green-600 mt-1">{e.description}</div>
              <div className="text-[10px] text-green-800 mt-1">{new Date(e.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
