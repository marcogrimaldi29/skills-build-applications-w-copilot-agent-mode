import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Team = { name: string; mascot?: string; members?: string[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getJson<{ teams: Team[] }>('/api/teams')
      .then(({ teams: result }) => {
        if (active) setTeams(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard title="Teams" description="Manage teams and members.">
      {error ? <p role="alert">Unable to load teams.</p>
        : teams === null ? <p role="status">Loading teams...</p>
          : teams.length === 0 ? <p role="status">No teams yet.</p>
            : <ul>{teams.map((team) => <li key={team.name}>
              <strong>{team.name}</strong>
              {team.mascot ? ` (${team.mascot})` : ''} · {team.members?.length ?? 0} members
            </li>)}</ul>}
    </CapabilityCard>
  );
}
