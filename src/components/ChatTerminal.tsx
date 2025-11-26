"use client";
import { useState, useEffect, useRef } from 'react';

interface MissionOffer {
  id: string;
  title: string;
  description: string;
  rewards: string;
  status: string;
}

interface Message {
  sender: 'YOU' | 'TARGET';
  text: string;
  timestamp: Date;
  mission?: MissionOffer;
}

interface ChatTerminalProps {
  sourceId: string;
  targetNpc: { id: string; name: string; faction: string | null };
  onClose: () => void;
}

export default function ChatTerminal({ sourceId, targetNpc, onClose }: ChatTerminalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMissionResponse = async (missionId: string, response: 'ACCEPTED' | 'DECLINED') => {
    try {
      const res = await fetch('/api/missions/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, response })
      });
      
      if (res.ok) {
        // Update local state to reflect change
        setMessages(prev => prev.map(msg => {
          if (msg.mission && msg.mission.id === missionId) {
            return { ...msg, mission: { ...msg.mission, status: response } };
          }
          return msg;
        }));
      }
    } catch (e) {
      console.error("Failed to respond to mission", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { sender: 'YOU', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/npc/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          targetId: targetNpc.id,
          content: userMsg.text,
          eventType: 'CHAT',
          model: 'gpt-4o' // Or make this configurable
        })
      });

      const responseData = await res.json();
      
      if (responseData.success && responseData.data) {
        const { targetReaction, mission } = responseData.data;
        
        if (targetReaction) {
          const replyMsg: Message = { 
            sender: 'TARGET', 
            text: targetReaction, 
            timestamp: new Date(),
            mission: mission
          };
          setMessages(prev => [...prev, replyMsg]);
        }
      } else {
        console.error("API Error:", responseData.error);
        setMessages(prev => [...prev, { sender: 'TARGET', text: `ERR: ${responseData.error || 'UNKNOWN_ERROR'}`, timestamp: new Date() }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { sender: 'TARGET', text: 'ERR: CONNECTION_LOST', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-black border border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-cyan-800 bg-cyan-900/20">
          <div>
            <h3 className="font-bold text-cyan-400 tracking-widest">SECURE_CHANNEL // {targetNpc.name}</h3>
            <div className="text-[10px] text-cyan-700">ENCRYPTION: AES-256-GCM // LATENCY: 12ms</div>
          </div>
          <button onClick={onClose} className="text-cyan-700 hover:text-red-500 text-xl font-bold px-2">×</button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
          <div className="text-center text-cyan-900 text-xs my-4">--- BEGIN ENCRYPTED TRANSMISSION ---</div>
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'YOU' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 border ${
                msg.sender === 'YOU' 
                  ? 'border-cyan-700 bg-cyan-900/10 text-cyan-300' 
                  : 'border-cyan-500 bg-black text-cyan-400'
              }`}>
                <div className="text-[10px] opacity-50 mb-1 flex justify-between gap-4">
                  <span>{msg.sender === 'YOU' ? 'OPERATOR' : targetNpc.name}</span>
                  <span>{msg.timestamp.toLocaleTimeString()}</span>
                </div>
                <div>{msg.text}</div>
                
                {msg.mission && (
                  <div className="mt-3 border-t border-cyan-800 pt-2 bg-cyan-900/20 p-2">
                    <div className="text-yellow-400 font-bold flex items-center gap-2">
                      <span className="text-xs">⚠</span> MISSION OFFER: {msg.mission.title}
                    </div>
                    <div className="text-xs text-cyan-300 my-1 italic">"{msg.mission.description}"</div>
                    <div className="text-xs text-cyan-500 font-bold">REWARD: {msg.mission.rewards}</div>
                    
                    {msg.mission.status === 'PENDING' ? (
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleMissionResponse(msg.mission!.id, 'ACCEPTED')} 
                          className="flex-1 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 text-xs px-2 py-1 border border-cyan-600 transition-colors"
                        >
                          [ ACCEPT ]
                        </button>
                        <button 
                          onClick={() => handleMissionResponse(msg.mission!.id, 'DECLINED')} 
                          className="flex-1 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs px-2 py-1 border border-red-600 transition-colors"
                        >
                          [ DECLINE ]
                        </button>
                      </div>
                    ) : (
                      <div className={`text-xs mt-2 font-bold border px-2 py-1 text-center ${
                        msg.mission.status === 'ACCEPTED' ? 'border-cyan-500 text-cyan-500' : 'border-red-500 text-red-500'
                      }`}>
                        STATUS: {msg.mission.status}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="text-cyan-700 text-xs animate-pulse">
                {targetNpc.name} is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-cyan-800 bg-black flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type message..."
            className="flex-1 bg-black border border-cyan-900 text-cyan-400 px-3 py-2 focus:border-cyan-500 outline-none font-mono text-sm"
            autoFocus
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="border border-cyan-600 text-cyan-500 hover:bg-cyan-900/30 px-6 py-2 uppercase text-xs tracking-widest disabled:opacity-30"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}
