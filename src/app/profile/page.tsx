"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WalletPanel from '@/components/WalletPanel';
import NPCList from '@/components/NPCList';
import NavBar from '@/components/NavBar';

export default function ProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [npc, setNpc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
          setNpc(data.npc);
        }
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleAction = async (actionType: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/npc/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType })
      });
      const data = await res.json();
      if (data.success) {
        setNpc(data.npc);
      } else {
        alert('Action failed: ' + data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center">LOADING_NEURAL_PROFILE...</div>;

  if (!user || !npc) return null;

  const isBusy = npc.actionExpiresAt && new Date(npc.actionExpiresAt) > new Date();

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-6">
      <NavBar user={user} npc={npc} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Stats */}
        <div className="space-y-6">
          <section className="border-terminal p-4 bg-black/50">
            <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">VITALS</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>STATUS</span>
                <span className={npc.status === 'ALIVE' ? 'text-green-400' : 'text-red-500'}>{npc.status}</span>
              </div>
              <div className="flex justify-between">
                <span>HEALTH</span>
                <div className="w-32 bg-green-900/30 h-4 mt-1">
                  <div className="bg-green-500 h-full" style={{ width: `${npc.health}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between">
                <span>FACTION</span>
                <span>{npc.faction || 'NONE'}</span>
              </div>
            </div>
          </section>

          <section className="border-terminal p-4 bg-black/50">
            <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">ASSETS</h2>
            <WalletPanel npcId={npc.id} />
          </section>
        </div>

        {/* Center: Current Task / Growth */}
        <div className="space-y-6">
          <section className="border-terminal p-4 bg-black/50 h-full">
            <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">CURRENT_DIRECTIVE</h2>
            <div className="text-center py-10">
              <div className="text-2xl font-bold text-green-300 animate-pulse">{npc.currentAction || 'IDLE'}</div>
              {isBusy ? (
                <div className="text-xs text-green-700 mt-2">
                  BUSY UNTIL: {new Date(npc.actionExpiresAt).toLocaleTimeString()}
                  <div className="mt-2 text-yellow-600 animate-pulse">TASK_IN_PROGRESS</div>
                </div>
              ) : (
                <div className="text-xs text-green-700 mt-2">AWAITING_ORDERS</div>
              )}
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button 
                  disabled={isBusy || actionLoading}
                  onClick={() => handleAction('SCAVENGE')}
                  className="border border-green-600 p-2 hover:bg-green-900/20 text-xs uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Initiate Scavenge
                </button>
                <button 
                  disabled={isBusy || actionLoading}
                  onClick={() => handleAction('TRAIN')}
                  className="border border-green-600 p-2 hover:bg-green-900/20 text-xs uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Train Combat
                </button>
                <button 
                  disabled={isBusy || actionLoading}
                  onClick={() => handleAction('REST')}
                  className="border border-green-600 p-2 hover:bg-green-900/20 text-xs uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Rest
                </button>
                <button 
                  disabled={isBusy || actionLoading}
                  onClick={() => handleAction('SOCIALIZE')}
                  className="border border-green-600 p-2 hover:bg-green-900/20 text-xs uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Socialize
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Comms */}
        <div className="space-y-6">
          <section className="border-terminal p-4 bg-black/50 h-full">
            <h2 className="text-xl font-bold mb-4 border-b border-green-900 pb-2">LOCAL_NETWORK</h2>
            <div className="text-xs text-green-700 mb-2">AVAILABLE_CONTACTS</div>
            <NPCList onSelect={(target) => {
              // TODO: Open chat modal
              alert(`Opening secure channel to ${target.name}... (Feature WIP)`);
            }} />
          </section>
        </div>
      </div>
    </div>
  );
}
