
import { useState } from 'react';
import WalletPanel from "./WalletPanel";
import InventoryPanel from "./InventoryPanel";
import CraftingPanel from "./CraftingPanel";
import MissionLog from "./MissionLog";
import MarketTerminal from "./MarketTerminal";
import NPCTrustPanel from "./NPCTrustPanel";
import MemoryList from "./MemoryList";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function NPCDetailsPanel({ selectedNpc }: { selectedNpc: any }) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INVENTORY' | 'MISSIONS' | 'CRAFTING' | 'MARKET' | 'MEMORY'>('OVERVIEW');

  if (!selectedNpc) return null;

  return (
    <div className="border-terminal bg-black/80 h-full flex flex-col">
      {/* Header / Tabs */}
      <div className="border-b border-cyan-900 p-2 flex flex-wrap gap-2 bg-black/90 sticky top-0 z-10">
        <div className="w-full flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-glow text-cyan-400">
            UNIT_DATA // {selectedNpc.name}
            </h2>
            <div className="text-xs text-cyan-700">{selectedNpc.id.slice(0, 8)}</div>
        </div>
        
        {['OVERVIEW', 'INVENTORY', 'MISSIONS', 'CRAFTING', 'MARKET', 'MEMORY'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-2 py-1 text-xs border transition-all duration-200 ${
              activeTab === tab 
                ? 'border-cyan-500 bg-cyan-900/30 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.3)]' 
                : 'border-cyan-900 text-cyan-700 hover:border-cyan-600 hover:text-cyan-500'
            }`}
          >
            [{tab}]
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <WalletPanel npcId={selectedNpc.id} />
            <div className="border border-cyan-900/50 p-3">
                <h3 className="text-cyan-400 font-bold mb-2">STATUS_REPORT</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-cyan-600">
                    <div>HEALTH: <span className="text-cyan-400">100%</span></div>
                    <div>ENERGY: <span className="text-cyan-400">85%</span></div>
                    <div>FACTION: <span className="text-cyan-400">{selectedNpc.faction || 'NONE'}</span></div>
                    <div>ROLE: <span className="text-cyan-400">{selectedNpc.job || 'SURVIVOR'}</span></div>
                </div>
            </div>
            <NPCTrustPanel sourceId={selectedNpc.id} />
          </div>
        )}

        {activeTab === 'INVENTORY' && (
          <div className="animate-in fade-in duration-300">
            <InventoryPanel selectedNpcId={selectedNpc.id} userId={selectedNpc.userId} />
          </div>
        )}

        {activeTab === 'MISSIONS' && (
          <div className="animate-in fade-in duration-300">
            <MissionLog npcId={selectedNpc.id} />
          </div>
        )}

        {activeTab === 'CRAFTING' && (
          <div className="animate-in fade-in duration-300">
            <CraftingPanel npcId={selectedNpc.id} />
          </div>
        )}

        {activeTab === 'MARKET' && (
          <div className="animate-in fade-in duration-300">
            <MarketTerminal selectedNpcId={selectedNpc.id} />
          </div>
        )}

        {activeTab === 'MEMORY' && (
          <div className="animate-in fade-in duration-300">
            <MemoryList npcId={selectedNpc.id} />
          </div>
        )}
      </div>
    </div>
  );
}
