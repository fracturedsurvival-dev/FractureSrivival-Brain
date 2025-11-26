"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InteractionConsole from "@/components/InteractionConsole";
import GodModePanel from "@/components/GodModePanel";
import SystemStatusPanel from "@/components/SystemStatusPanel";
import WorldStatusTest from "@/components/WorldStatusTest";
import WorldEventLog from "@/components/WorldEventLog";
import FactionPanel from "@/components/FactionPanel";

export default function AdminPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user || data.user.role !== 'ADMIN') {
          router.push('/');
        } else {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/');
      });
  }, [router]);

  if (loading) return <div className="min-h-screen bg-black text-red-500 font-mono flex items-center justify-center">VERIFYING_CLEARANCE...</div>;

  if (!user) return null;

  return (
    <main className="min-h-screen bg-black text-red-500 font-mono p-6 space-y-6">
      <div className="border-b border-red-900 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-glow tracking-tighter">ADMIN_CONSOLE</h1>
          <p className="text-xs text-red-800 tracking-widest">RESTRICTED ACCESS // LEVEL 5</p>
        </div>
        <button onClick={() => router.push('/')} className="text-red-500 hover:text-red-300 text-sm uppercase border border-red-900 px-4 py-2">
          Exit to Simulation
        </button>
      </div>

      <SystemStatusPanel />
      
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <section className="border border-red-900 p-4 bg-black/50">
            <h2 className="text-xl font-bold mb-4 border-b border-red-900 pb-2">WORLD_CONTROLS</h2>
            <WorldStatusTest />
            <div className="mt-4">
               <WorldEventLog />
            </div>
          </section>

          <section className="border border-red-900 p-4 bg-black/50">
             <h2 className="text-xl font-bold mb-4 border-b border-red-900 pb-2">FACTION_OVERRIDE</h2>
             <FactionPanel />
          </section>
        </div>

        <div className="space-y-6">
           <section className="border border-red-900 p-4 bg-black/50">
             <InteractionConsole />
           </section>
           
           <section className="border border-red-900 p-4 bg-black/50">
             <GodModePanel />
           </section>
        </div>
      </div>
    </main>
  );
}
