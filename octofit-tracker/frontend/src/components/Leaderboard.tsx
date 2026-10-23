import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then(({ leaderboard: result }) => {
        if (active) setLeaderboard(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard title="Leaderboard" description="Compare team point totals.">
      {error ? <p role="alert">Unable to load leaderboard.</p>
        : leaderboard === null ? <p role="status">Loading leaderboard...</p>
          : leaderboard.length === 0 ? <p role="status">No leaderboard scores yet.</p>
            : <ol>{leaderboard.map((entry) => <li key={entry.rank}>
              <strong>{entry.teamName}</strong>: {entry.totalPoints} points
            </li>)}</ol>}
    </CapabilityCard>
  );
}
