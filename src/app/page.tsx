"use client";

import NPCDetailsPanel from "@/components/NPCDetailsPanel";
import NavBar from "@/components/NavBar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Artifact3D from "@/components/Artifact3D";
import WorldEventLog from "@/components/WorldEventLog";
import FactionPanel from "@/components/FactionPanel";
import NPCList from "@/components/NPCList";
import InteractionConsole from "@/components/InteractionConsole";

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

  if (loading) return (
    <div className="min-h-screen bg-black text-cyan-500 font-mono flex flex-col items-center justify-center">
        <div className="animate-pulse text-2xl tracking-widest">INITIALIZING_SYSTEM...</div>
        <div className="text-xs text-cyan-800 mt-2">ESTABLISHING_NEURAL_LINK</div>
    </div>
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-cyan-500 font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        <div className="z-10 text-center space-y-8 max-w-2xl">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-glow tracking-tighter animate-pulse text-cyan-400">FRACTURED_SURVIVAL</h1>
            <p className="text-xl text-cyan-700 tracking-widest">SIMULATION_CORE_V2.0</p>
          </div>
          
          <div className="border-l-2 border-cyan-900 pl-6 text-left space-y-4 text-cyan-400/80 bg-black/50 p-4 backdrop-blur-sm">
            <p>The world has fractured. Reality is unstable.</p>
            <p>Survivors cling to existence in a decaying digital landscape. Factions war for resources while the World Engine generates chaos.</p>
            <p>Initialize your neural link to participate in the simulation.</p>
          </div>

          <div className="flex gap-4 justify-center pt-8">
            <Link href="/login" className="px-8 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] uppercase tracking-widest transition-all duration-300">
              Enter Simulation
            </Link>
            <Link href="/signup" className="px-8 py-3 border border-cyan-800 text-cyan-600 hover:bg-cyan-900/20 hover:text-cyan-400 uppercase tracking-widest transition-all duration-300">
              Initialize Subject
            </Link>
          </div>
        </div>
        <div className="absolute bottom-4 text-xs text-cyan-900">SYSTEM_STATUS: ONLINE // POPULATION: UNKNOWN</div>
      </main>
    );
  }

  return (
    <main className="space-y-6 text-cyan-500 font-mono pb-10">
      <NavBar user={user} npc={npc} />

      <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        {/* Left Column: World State (3 cols) */}
        <div className="lg:col-span-3 space-y-6 overflow-y-auto custom-scrollbar pr-2">
          <section className="border-terminal p-4 bg-black/50 hover:bg-black/70 transition-colors">
            <h2 className="text-xl font-bold mb-4 border-b border-cyan-900 pb-2 text-glow text-cyan-400">ARTIFACT_ANALYSIS</h2>
            <Artifact3D />
          </section>

          <section className="border-terminal p-4 bg-black/50 hover:bg-black/70 transition-colors">
            <h2 className="text-xl font-bold mb-4 border-b border-cyan-900 pb-2 text-glow text-cyan-400">WORLD_STATE</h2>
            <div className="mt-4">
               <WorldEventLog />
            </div>
          </section>
          
          <section className="border-terminal p-4 bg-black/50 hover:bg-black/70 transition-colors">
             <h2 className="text-xl font-bold mb-4 border-b border-cyan-900 pb-2 text-glow text-cyan-400">FACTIONS</h2>
             <FactionPanel />
          </section>
        </div>

        {/* Center Column: Interaction (5 cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
           <section className="flex-1 flex flex-col border-terminal p-4 bg-black/50">
             <InteractionConsole />
           </section>
        </div>

        {/* Right Column: NPC Data (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
          {!selectedNpc ? (
            <section className="border-terminal p-4 bg-black/50 h-full flex flex-col">
              <h2 className="text-xl font-bold mb-4 border-b border-cyan-900 pb-2 text-glow text-cyan-400">NEURAL_NET_TARGETS</h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <NPCList onSelect={setSelectedNpc} />
              </div>
              <div className="mt-4 text-xs text-cyan-800 text-center animate-pulse">
                SELECT_TARGET_FOR_ANALYSIS
              </div>
            </section>
          ) : (
            <div className="h-full flex flex-col gap-4">
                <div className="shrink-0">
                    <button 
                        onClick={() => setSelectedNpc(null)}
                        className="w-full border border-cyan-900 text-cyan-700 hover:text-cyan-400 hover:border-cyan-500 text-xs py-2 mb-2 transition-all"
                    >
                        ← RETURN_TO_TARGET_LIST
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <NPCDetailsPanel selectedNpc={selectedNpc} />
                </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


