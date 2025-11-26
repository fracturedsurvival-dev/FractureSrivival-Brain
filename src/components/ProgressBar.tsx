
import { useEffect, useState } from 'react';

interface ProgressBarProps {
  expiresAt: string | null;
  onComplete: () => void;
}

export default function ProgressBar({ expiresAt, onComplete }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      setProgress(0);
      return;
    }

    const targetTime = new Date(expiresAt).getTime();
    const now = Date.now();
    
    // Calculate initial remaining time
    let initialRemaining = targetTime - now;

    // CLOCK SKEW FIX:
    // If the remaining time is unreasonably large (e.g. > 4s for a 3s action),
    // it implies the client clock is behind the server. 
    // We clamp the duration to 3s to ensure the UI is snappy.
    if (initialRemaining > 3500) {
        initialRemaining = 3000;
    }
    
    // If remaining is negative (client ahead), default to a short animation or done.
    if (initialRemaining <= 0) {
        // Prevent state update during render
        setTimeout(() => onComplete(), 0);
        return;
    }

    const duration = Math.min(initialRemaining, 3000);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [expiresAt]); // Removed onComplete from deps to avoid re-triggering

  if (!expiresAt) return null;

  return (
    <div className="w-full bg-cyan-900/30 h-2 mt-2 relative overflow-hidden">
      <div 
        className="bg-cyan-500 h-full transition-all duration-75 ease-linear" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
