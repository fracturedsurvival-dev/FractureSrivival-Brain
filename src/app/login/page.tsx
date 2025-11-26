"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      router.push('/profile');
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-green-900 p-6 bg-black/90 shadow-[0_0_20px_rgba(0,255,0,0.1)]">
        <h1 className="text-2xl font-bold mb-6 text-center uppercase tracking-widest">Neural Link Access</h1>
        
        {error && <div className="bg-red-900/20 border border-red-500 text-red-500 p-2 mb-4 text-xs">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase mb-1">Identity Hash (Email)</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black border border-green-800 p-2 text-green-400 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase mb-1">Access Key (Password)</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black border border-green-800 p-2 text-green-400 focus:border-green-500 outline-none"
            />
          </div>
          <button type="submit" className="w-full bg-green-900/20 border border-green-600 text-green-400 py-2 hover:bg-green-900/40 uppercase tracking-widest transition-all">
            Establish Connection
          </button>
        </form>
        
        <div className="mt-4 text-center text-xs">
          <span className="text-green-800">No identity found? </span>
          <Link href="/signup" className="text-green-400 hover:underline">Initialize New Subject</Link>
        </div>
      </div>
    </div>
  );
}
