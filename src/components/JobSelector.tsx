
'use client';

import { useState, useEffect } from 'react';

interface Job {
  id: string;
  name: string;
  description: string;
}

interface JobSelectorProps {
  currentJob: string | null;
  onJobChange: () => void;
}

export default function JobSelector({ currentJob, onJobChange }: JobSelectorProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data));
  }, []);

  const handleSelectJob = async (jobId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        onJobChange();
      }
    } catch (error) {
      console.error('Failed to update job', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/80 border border-cyan-900/50 p-4 rounded-lg mb-4">
      <h3 className="text-cyan-500 text-lg font-mono mb-2">/// JOB_ASSIGNMENT</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {jobs.map(job => (
          <button
            key={job.id}
            onClick={() => handleSelectJob(job.id)}
            disabled={loading || currentJob === job.id}
            className={`p-3 border rounded text-left transition-colors ${
              currentJob === job.id
                ? 'border-cyan-500 bg-cyan-900/30 text-cyan-400'
                : 'border-cyan-900/30 text-gray-500 hover:border-cyan-500/50 hover:text-cyan-400'
            }`}
          >
            <div className="font-bold">{job.name}</div>
            <div className="text-xs opacity-70">{job.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
