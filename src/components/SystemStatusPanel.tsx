"use client";

import React, { useEffect, useState } from 'react';

export default function SystemStatusPanel() {
  const [uptime, setUptime] = useState(0);
  const [memoryLoad, setMemoryLoad] = useState(42);
  const [networkStatus, setNetworkStatus] = useState("CONNECTED");
  const [autoRun, setAutoRun] = useState(false);
  const [lastTurnLog, setLastTurnLog] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(u => u + 1);
      setMemoryLoad(prev => {
        const change = Math.random() * 10 - 5;
        return Math.min(99, Math.max(10, prev + change));
      });
      
      if (Math.random() > 0.98) {
        setNetworkStatus("REROUTING...");
        setTimeout(() => setNetworkStatus("CONNECTED"), 1000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let turnInterval: NodeJS.Timeout;
    if (autoRun) {
      turnInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/world/turn', { method: 'POST' });
          const data = await res.json();
          if (data.npcLogs) {
            setLastTurnLog(prev => [...data.npcLogs, ...prev].slice(0, 5));
          }
        } catch (e) {
          console.error("Auto-Run Error", e);
        }
      }, 10000); // Run every 10 seconds
    }
    return () => clearInterval(turnInterval);
  }, [autoRun]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-terminal p-4 bg-terminal-dim mb-6 font-mono text-sm">
      <div className="flex justify-between items-center border-b border-cyan-900 pb-2 mb-2">
        <h2 className="text-glow font-bold uppercase">System Status // OVERWATCH_V2</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setAutoRun(!autoRun)}
            className={`px-3 py-1 border text-xs uppercase tracking-widest transition-all ${
              autoRun 
                ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400 animate-pulse' 
                : 'border-cyan-800 text-cyan-700 hover:border-cyan-500'
            }`}
          >
            {autoRun ? '■ STOP SIMULATION' : '▶ START SIMULATION'}
          </button>
          <span className="animate-pulse">● LIVE</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-cyan-700">UPTIME</div>
          <div className="text-lg">{formatTime(uptime)}</div>
        </div>
        
        <div>
          <div className="text-xs text-cyan-700">MEMORY_INTEGRITY</div>
          <div className="w-full bg-cyan-900 h-4 mt-1 border border-cyan-800">
            <div 
              className="bg-cyan-500 h-full transition-all duration-500" 
              style={{ width: `${memoryLoad}%` }}
            />
          </div>
          <div className="text-right text-xs mt-1">{memoryLoad.toFixed(1)}%</div>
        </div>

        <div>
          <div className="text-xs text-cyan-700">NETWORK_LAYER</div>
          <div className={`text-lg ${networkStatus !== "CONNECTED" ? "text-yellow-500" : ""}`}>
            {networkStatus}
          </div>
        </div>

        <div>
          <div className="text-xs text-cyan-700">THREAT_LEVEL</div>
          <div className="text-lg text-red-500 animate-pulse">ELEVATED</div>
        </div>
      </div>

      {/* Simulation Log */}
      {lastTurnLog.length > 0 && (
        <div className="mt-4 border-t border-cyan-900 pt-2">
          <div className="text-xs text-cyan-700 mb-1">SIMULATION_LOG:</div>
          <div className="space-y-1">
            {lastTurnLog.map((log, i) => (
              <div key={i} className="text-xs text-cyan-400 truncate opacity-80 hover:opacity-100">
                {'>'} {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
