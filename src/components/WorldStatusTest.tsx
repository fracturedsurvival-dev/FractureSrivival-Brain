"use client";
import { useEffect, useState } from 'react';

export default function WorldStatusTest() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchStatus = () => {
    fetch('/api/world/status')
      .then(r => r.json())
      .then(j => setData(j))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const advanceTime = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/world/turn', { method: 'POST' });
      const json = await res.json();
      if (json.logs) {
        setLogs(prev => [...json.logs, ...prev].slice(0, 5));
      }
      fetchStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-xs text-green-700 animate-pulse">PINGING_WORLD_STATUS...</div>;
  if (error) return <div className="text-xs text-red-500">CONNECTION_ERROR: {error}</div>;

  return (
    <div className="font-mono text-xs space-y-4">
      <div className="space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between border-b border-green-900/30 pb-1">
            <span className="text-green-600 uppercase">{key}</span>
            <span className="text-green-400">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={advanceTime}
        disabled={processing}
        className="w-full border border-green-500 text-green-400 hover:bg-green-900/30 py-2 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'SIMULATING...' : 'ADVANCE_WORLD_CLOCK'}
      </button>

      {logs.length > 0 && (
        <div className="border-t border-green-900 pt-2">
          <div className="text-green-700 mb-1">SIMULATION_LOGS:</div>
          <ul className="space-y-1 text-[10px]">
            {logs.map((log, i) => (
              <li key={i} className="text-green-500">{'>'} {log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
