import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Workout = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };
const userEmail = 'mona@example.com';

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`)
      .then(({ suggestions: result }) => {
        if (active) setSuggestions(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns.">
      {error ? <p role="alert">Unable to load workout suggestions.</p>
        : suggestions === null ? <p role="status">Loading workout suggestions...</p>
          : suggestions.length === 0 ? <p role="status">No workout suggestions yet.</p>
            : <ul>{suggestions.map((workout) => <li key={workout.title}>
              <strong>{workout.title}</strong>
              {workout.focus ? ` · ${workout.focus}` : ''}
              {workout.minutes ? ` · ${workout.minutes} minutes` : ''}
              {workout.difficulty ? ` · ${workout.difficulty}` : ''}
              {workout.reason ? <p>{workout.reason}</p> : null}
            </li>)}</ul>}
    </CapabilityCard>
  );
}
