"use client";
import { useState } from 'react';
import NPCList from './NPCList';

const models = [
  process.env.NEXT_PUBLIC_GPT_MODEL || 'gpt-5',
  process.env.NEXT_PUBLIC_CLAUDE_MODEL || 'claude-sonnet-4.5'
];

export default function InteractionConsole() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sourceNpc, setSourceNpc] = useState<any>(null);
  const [targetId, setTargetId] = useState('');
  const [content, setContent] = useState('');
  const [eventType, setEventType] = useState('GREET');
  const [model, setModel] = useState(models[0]);
  const [memoryText, setMemoryText] = useState('');
  const [trustEventType, setTrustEventType] = useState('HELP');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function post(path: string, body: any) {
    setLoading(true);
    setOutput(null);
    try {
      const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      setOutput({ path, status: res.status, json });
    } catch (e) {
      setOutput({ error: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 font-mono text-sm">
      <h2 className="font-bold text-lg text-glow border-b border-green-900 pb-2">INTERACTION_CONSOLE</h2>
      
      <div className="grid gap-4">
        {/* Source Selection */}
        <div className="border border-green-900 p-3 bg-black/30">
          <h3 className="text-green-400 mb-2 uppercase">1. Source Configuration</h3>
          <NPCList onSelect={setSourceNpc} />
          {sourceNpc && <div className="text-xs text-green-300 mt-2">{'>'}{'>'} LOCKED: {sourceNpc.name}</div>}
        </div>

        {/* Interaction Parameters */}
        <div className="border border-green-900 p-3 bg-black/30 space-y-3">
           <h3 className="text-green-400 mb-2 uppercase">2. Vector Parameters</h3>
           
           <div className="grid grid-cols-2 gap-2">
             <label className="block">
               <span className="text-xs text-green-700">TARGET_ID</span>
               <input 
                 className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 focus:border-green-500 outline-none" 
                 value={targetId} 
                 onChange={e => setTargetId(e.target.value)} 
                 placeholder="npc_vera" 
               />
             </label>
             
             <label className="block">
               <span className="text-xs text-green-700">PROTOCOL</span>
               <select 
                 className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 focus:border-green-500 outline-none"
                 value={eventType} 
                 onChange={e => setEventType(e.target.value)}
               >
                 <option>GREET</option>
                 <option>HELP</option>
                 <option>BETRAY</option>
               </select>
             </label>
           </div>

           <label className="block">
             <span className="text-xs text-green-700">LLM_MODEL</span>
             <select 
               className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 focus:border-green-500 outline-none"
               value={model} 
               onChange={e => setModel(e.target.value)}
             >
               {models.map(m => <option key={m}>{m}</option>)}
             </select>
           </label>

           <label className="block">
             <span className="text-xs text-green-700">PAYLOAD</span>
             <textarea 
               className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 focus:border-green-500 outline-none"
               rows={3} 
               value={content} 
               onChange={e => setContent(e.target.value)} 
               placeholder="Enter interaction content..." 
             />
           </label>

           <button 
             disabled={loading || !sourceNpc || !targetId || !content} 
             onClick={() => post('/api/npc/interact', { sourceId: sourceNpc.id, targetId, content, eventType, model })} 
             className="w-full border border-green-600 text-green-500 hover:bg-green-900/30 px-3 py-2 uppercase text-xs tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
           >
             Execute Interaction
           </button>
           
           <button 
             disabled={loading || !sourceNpc || !targetId} 
             onClick={() => post('/api/combat/attack', { attackerId: sourceNpc.id, defenderId: targetId })} 
             className="w-full border border-red-600 text-red-500 hover:bg-red-900/30 px-3 py-2 uppercase text-xs tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-colors mt-2"
           >
             INITIATE COMBAT
           </button>
        </div>

        {/* Memory & Trust */}
        <div className="border border-green-900 p-3 bg-black/30 space-y-3">
          <h3 className="text-green-400 mb-2 uppercase">3. Memory & Trust Injection</h3>
          
          <div className="space-y-2">
            <label className="block text-xs text-green-700">MEMORY_CONTENT</label>
            <textarea 
              className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 focus:border-green-500 outline-none"
              rows={2} 
              value={memoryText} 
              onChange={e => setMemoryText(e.target.value)} 
            />
            <div className="flex gap-2">
              <input 
                className="w-1/2 bg-black border border-green-800 text-green-500 px-2 py-1 text-xs" 
                placeholder="Tags (comma sep)" 
                id="memTags" 
              />
              <input 
                className="w-1/2 bg-black border border-green-800 text-green-500 px-2 py-1 text-xs" 
                type="number" 
                min="1" 
                max="10" 
                placeholder="Imp (1-10)" 
                id="memImp" 
              />
            </div>
            <button 
              disabled={loading || !sourceNpc || !memoryText} 
              onClick={() => post('/api/memory/add', { 
                npcId: sourceNpc.id, 
                rawContent: memoryText, 
                model,
                tags: (document.getElementById('memTags') as HTMLInputElement).value,
                importance: parseInt((document.getElementById('memImp') as HTMLInputElement).value) || 1
              })} 
              className="w-full border border-indigo-900 text-indigo-400 hover:bg-indigo-900/20 px-2 py-1 text-xs uppercase"
            >
              Inject Memory
            </button>
          </div>

          <div className="border-t border-green-900 pt-2 space-y-2">
             <label className="block text-xs text-green-700">TRUST_MODIFIER</label>
             <select 
               className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 focus:border-green-500 outline-none"
               value={trustEventType} 
               onChange={e => setTrustEventType(e.target.value)}
             >
               <option>HELP</option>
               <option>BETRAY</option>
               <option>GREET</option>
             </select>
             <button 
               disabled={loading || !sourceNpc || !targetId} 
               onClick={() => post('/api/trust/update', { sourceId: sourceNpc.id, targetId, eventType: trustEventType })} 
               className="w-full border border-green-600 text-green-500 hover:bg-green-900/20 px-2 py-1 text-xs uppercase"
             >
               Update Trust Matrix
             </button>
          </div>
        </div>

        {/* World & Factions */}
        <div className="border border-green-900 p-3 bg-black/30 space-y-3">
          <h3 className="text-green-400 mb-2 uppercase">4. World State Manipulation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs text-green-700 uppercase">Trigger Event</h4>
              <input className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 text-xs" placeholder="Event Title" id="evtTitle" />
              <input className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 text-xs" placeholder="Description" id="evtDesc" />
              <select className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 text-xs" id="evtType">
                <option>WEATHER</option>
                <option>POLITICAL</option>
                <option>INVASION</option>
                <option>RESOURCE</option>
              </select>
              <button 
                onClick={() => post('/api/world/events/trigger', { 
                  title: (document.getElementById('evtTitle') as HTMLInputElement).value,
                  description: (document.getElementById('evtDesc') as HTMLInputElement).value,
                  type: (document.getElementById('evtType') as HTMLSelectElement).value
                })}
                className="w-full border border-orange-900 text-orange-500 hover:bg-orange-900/20 px-2 py-1 text-xs uppercase"
              >Trigger</button>
              <button 
                onClick={() => post('/api/world/events/trigger', { generate: true })}
                className="w-full border border-orange-600 text-orange-400 hover:bg-orange-900/40 px-2 py-1 text-xs uppercase animate-pulse"
              >
                Generate Random Event
              </button>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs text-green-700 uppercase">Create Faction</h4>
              <input className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 text-xs" placeholder="Faction Name" id="facName" />
              <input className="w-full bg-black border border-green-800 text-green-500 px-2 py-1 text-xs" placeholder="Description" id="facDesc" />
              <button 
                onClick={() => post('/api/factions/create', { 
                  name: (document.getElementById('facName') as HTMLInputElement).value,
                  description: (document.getElementById('facDesc') as HTMLInputElement).value
                })}
                className="w-full border border-purple-900 text-purple-500 hover:bg-purple-900/20 px-2 py-1 text-xs uppercase"
              >Create</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Output */}
      <div className="border border-green-900 p-3 bg-black">
        <h3 className="text-green-700 text-xs mb-2">SYSTEM_OUTPUT</h3>
        {loading && <div className="animate-pulse text-green-500">PROCESSING...</div>}
        {!loading && output && (
          <div className="text-xs text-green-400 whitespace-pre-wrap overflow-x-auto">
            <div className="mb-2">STATUS: {output.status === 200 ? 'SUCCESS' : 'FAILURE'}</div>
            {output.json?.targetReaction && (
              <div className="border-l-2 border-green-500 pl-2 mb-2">
                <div className="text-green-700">TARGET_REACTION:</div>
                <div className="text-green-300 italic">&quot;{output.json.targetReaction}&quot;</div>
              </div>
            )}
            <pre>{JSON.stringify(output.json, null, 2)}</pre>
          </div>
        )}
        {!loading && !output && <div className="text-xs text-green-900">AWAITING_DATA...</div>}
      </div>
    </div>
  );
}
