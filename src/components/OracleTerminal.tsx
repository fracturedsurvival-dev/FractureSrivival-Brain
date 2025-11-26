"use client";

import React, { useState, useRef, useEffect } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export default function OracleTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const addLog = (source: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      source,
      message,
      type
    }]);
  };

  // Initial boot sequence
  useEffect(() => {
    const bootSequence = [
      { msg: "Initializing Oracle Interface...", type: 'info' },
      { msg: "Connecting to Neural Link...", type: 'info' },
      { msg: "Handshake established.", type: 'success' },
      { msg: "Awaiting operator command.", type: 'warning' }
    ];

    let delay = 0;
    bootSequence.forEach((item) => {
      delay += 800;
      setTimeout(() => {
        addLog("SYSTEM", item.msg, item.type as LogEntry['type']);
      }, delay);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userCmd = input;
    setInput('');
    addLog("OPERATOR", userCmd, 'info');
    
    // Local commands
    if (userCmd.toLowerCase() === 'help') {
      setTimeout(() => addLog("ORACLE", "COMMANDS: STATUS, SCAN, PURGE, ANALYZE", 'success'), 200);
      return;
    }
    if (userCmd.toLowerCase() === 'clear') {
      setLogs([]);
      return;
    }

    // Remote AI Query
    try {
      addLog("SYSTEM", "TRANSMITTING...", 'warning');
      const res = await fetch('/api/oracle/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userCmd })
      });
      const data = await res.json();
      addLog("ORACLE", data.response, 'success');
    } catch (err) {
      console.error(err);
      addLog("ORACLE", "CONNECTION_LOST", 'error');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'success': return 'text-green-400';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="border-terminal bg-black h-96 flex flex-col font-mono text-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 text-xs text-green-800">v2.4.1</div>
      
      {/* Output Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-green-800">[{log.timestamp}]</span>
            <span className="text-green-700 font-bold">{log.source}:</span>
            <span className={getTypeColor(log.type)}>{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-green-900 p-2 flex gap-2 bg-terminal-dim">
        <span className="text-green-500 animate-pulse">{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-green-900"
          placeholder="Enter command..."
          autoFocus
        />
      </form>
    </div>
  );
}
