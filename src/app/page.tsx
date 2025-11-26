"use client";
import Artifact3D from "@/components/Artifact3D";
import WorldStatusTest from "@/components/WorldStatusTest";
import NPCList from "@/components/NPCList";
import NPCTrustPanel from "@/components/NPCTrustPanel";
import MemoryList from "@/components/MemoryList";
import InteractionConsole from "@/components/InteractionConsole";
import FactionPanel from "@/components/FactionPanel";
import WorldEventLog from "@/components/WorldEventLog";
import SystemStatusPanel from "@/components/SystemStatusPanel";
import OracleTerminal from "@/components/OracleTerminal";
import GodModePanel from "@/components/GodModePanel";
import WalletPanel from "@/components/WalletPanel";
import MarketTerminal from "@/components/MarketTerminal";
import NavBar from "@/components/NavBar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedNpc, setSelectedNpc] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [npc, setNpc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setNpc(data.npc);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center">INITIALIZING_SYSTEM...</div>;

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        <div className="z-10 text-center space-y-8 max-w-2xl">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-glow tracking-tighter">FRACTURED_SURVIVAL</h1>
            <p className="text-xl text-green-700 tracking-widest">SIMULATION_CORE_V1.0</p>
          </div>
          
          <div className="border-l-2 border-green-900 pl-6 text-left space-y-4 text-green-400/80">
            <p>The world has fractured. Reality is unstable.</p>
            <p>Survivors cling to existence in a decaying digital landscape. Factions war for resources while the World Engine generates chaos.</p>
            <p>Initialize your neural link to participate in the simulation.</p>
          </div>

          <div className="flex gap-4 justify-center pt-8">
            <Link href="/login" className="px-8 py-3 border border-green-500 text-green-400 hover:bg-green-500/10 uppercase tracking-widest transition-all">
              Enter Simulation
            </Link>
            <Link href="/signup" className="px-8 py-3 border border-green-800 text-green-600 hover:bg-green-900/20 uppercase tracking-widest transition-all">
              Initialize Subject
            </Link>
          </div>
        </div>
        <div className="absolute bottom-4 text-xs text-green-900">SYSTEM_STATUS: ONLINE // POPULATION: UNKNOWN</div>
      </main>
    );
  }

  return (
    <main className="space-y-6 text-green-500 font-mono">
      <GodModePanel />
      <NavBar user={user} npc={npc} />

      <SystemStatusPanel />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: World State */}
        <div className="space-y-6">
          <section className="border-terminal p-4 bg-black/50">
            <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">ARTIFACT_ANALYSIS</h2>
            <Artifact3D />
          </section>

          <section className="border-terminal p-4 bg-black/50">
            <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">WORLD_STATE</h2>
            <WorldStatusTest />
            <div className="mt-4">
               <WorldEventLog />
            </div>
          </section>
          
          <section className="border-terminal p-4 bg-black/50">
             <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">FACTIONS</h2>
             <FactionPanel />
          </section>
        </div>

        {/* Center Column: Interaction & Oracle */}
        <div className="space-y-6">
           <section>
             <OracleTerminal />
           </section>
           
           <section className="border-terminal p-4 bg-black/50">
             <InteractionConsole />
           </section>
        </div>

        {/* Right Column: NPC Data */}
        <div className="space-y-6">
          <section className="border-terminal p-4 bg-black/50">
            <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">NEURAL_NET_TARGETS</h2>
            <NPCList onSelect={setSelectedNpc} />
          </section>

          {selectedNpc && (
            <>
              <WalletPanel npcId={selectedNpc.id} />
              <MarketTerminal selectedNpcId={selectedNpc.id} />
              
              <section className="border-terminal p-4 bg-black/50">
                <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">TRUST_METRICS // {selectedNpc.name}</h2>
                <NPCTrustPanel sourceId={selectedNpc.id} />
              </section>
              
              <section className="border-terminal p-4 bg-black/50">
                <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">MEMORY_BANKS</h2>
                <MemoryList npcId={selectedNpc.id} />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
