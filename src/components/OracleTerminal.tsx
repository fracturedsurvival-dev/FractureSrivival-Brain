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
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const playAudio = (text: string) => {
    if (!audioEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const preferredVoice = voices.find(v => v.name.includes('Zira') || v.name.includes('Google US English')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.pitch = 1.0; 
    utterance.rate = 1.0; 
    window.speechSynthesis.speak(utterance);
  };

  const addLog = (source: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      source,
      message,
      type
    }]);
  };

  useEffect(() => {
    if (!isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isMinimized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userCmd = input;
    setInput('');
    addLog("OPERATOR", userCmd, 'info');
    
    try {
      const res = await fetch('/api/oracle/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userCmd })
      });
      const data = await res.json();
      addLog("ORACLE", data.response, 'success');
      playAudio(data.response);
    } catch (err) {
      console.error(err);
      addLog("ORACLE", "CONNECTION_LOST", 'error');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-cyan-300';
      default: return 'text-blue-300';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${isMinimized ? 'w-12 h-12 rounded-full' : 'w-96 h-96 rounded-lg'} border border-cyan-500/50 bg-black/90 shadow-[0_0_20px_rgba(0,240,255,0.2)] backdrop-blur-md overflow-hidden flex flex-col`}>
      
      {/* Header / Toggle */}
      <div 
        className="bg-cyan-900/30 p-2 flex justify-between items-center cursor-pointer hover:bg-cyan-900/50 transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${audioEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`} />
          {!isMinimized && <span className="text-xs font-bold text-cyan-300 tracking-widest">ORACLE_AI_HELPER</span>}
        </div>
        {isMinimized ? (
          <span className="text-cyan-400 text-xs">▲</span>
        ) : (
          <div className="flex gap-2">
             <button 
               onClick={(e) => { e.stopPropagation(); setAudioEnabled(!audioEnabled); }}
               className={`text-[10px] ${audioEnabled ? 'text-cyan-300' : 'text-gray-500'}`}
             >
               {audioEnabled ? 'VOL_ON' : 'VOL_OFF'}
             </button>
             <span className="text-cyan-400 text-xs">▼</span>
          </div>
        )}
      </div>

      {/* Content (Hidden when minimized) */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-black/50">
            {logs.length === 0 && (
              <div className="text-center text-cyan-700 text-xs mt-10">
                <p>ORACLE ONLINE</p>
                <p>AWAITING INPUT...</p>
              </div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="text-xs font-mono">
                <span className="text-cyan-700 opacity-50">[{log.timestamp}]</span>{' '}
                <span className="text-blue-400 font-bold">{log.source}:</span>{' '}
                <span className={getTypeColor(log.type)}>{log.message}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-2 bg-cyan-900/10 border-t border-cyan-900/30 flex gap-2">
            <span className="text-cyan-500">{'>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-cyan-300 placeholder-cyan-800 text-xs font-mono"
              placeholder="Ask Oracle..."
              autoFocus
            />
          </form>
        </>
      )}
    </div>
  );
}

