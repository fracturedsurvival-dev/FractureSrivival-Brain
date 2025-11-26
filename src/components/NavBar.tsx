"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function NavBar({ user, npc }: { user?: any, npc?: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'auth_token=; Max-Age=0';
    router.push('/login');
  };

  return (
    <nav className="border-b border-cyan-800 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-glow tracking-tighter text-cyan-400">
          FRACTURED_SURVIVAL // {pathname === '/profile' ? 'UNIT_LINK' : 'CORE_SYSTEM'}
        </h1>
        <div className="flex gap-4 text-xs text-cyan-700 mt-1 font-mono">
          {user && <span>OP: {user.email}</span>}
          {npc && <span>UNIT: {npc.name}</span>}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 w-full md:w-auto">
        <div className="flex gap-2 text-xs font-mono w-full md:w-auto justify-end">
          <Link 
            href="/" 
            className={`px-3 py-1 border transition-all duration-300 ${pathname === '/' ? 'bg-cyan-900/30 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'border-cyan-900 text-cyan-700 hover:border-cyan-500 hover:text-cyan-400 hover:shadow-[0_0_8px_rgba(0,240,255,0.4)] hover:bg-cyan-900/10'}`}
          >
            WORLD_BRAIN
          </Link>
          <Link 
            href="/profile" 
            className={`px-3 py-1 border transition-all duration-300 ${pathname === '/profile' ? 'bg-cyan-900/30 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'border-cyan-900 text-cyan-700 hover:border-cyan-500 hover:text-cyan-400 hover:shadow-[0_0_8px_rgba(0,240,255,0.4)] hover:bg-cyan-900/10'}`}
          >
            MY_UNIT
          </Link>
          {user?.role === 'ADMIN' && (
            <Link 
              href="/admin" 
              className={`px-3 py-1 border transition-all duration-300 ${pathname === '/admin' ? 'bg-red-900/30 border-red-500 text-red-300 shadow-[0_0_10px_rgba(255,0,0,0.2)]' : 'border-red-900 text-red-700 hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_8px_rgba(255,0,0,0.4)] hover:bg-red-900/10'}`}
            >
              ADMIN_CONSOLE
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="px-3 py-1 border border-red-900 text-red-700 hover:bg-red-900/20 hover:text-red-500 hover:border-red-600 hover:shadow-[0_0_8px_rgba(255,0,0,0.4)] transition-all duration-300"
          >
            DISCONNECT
          </button>
        </div>
        <div className="text-[10px] text-cyan-800 animate-pulse hidden md:block">
          SECURE_CONNECTION_ESTABLISHED
        </div>
      </div>
    </nav>
  );
}
