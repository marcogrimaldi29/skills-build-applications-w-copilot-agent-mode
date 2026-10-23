import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getJson<{ activities: Activity[] }>('/api/activities')
      .then(({ activities: result }) => {
        if (active) setActivities(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points.">
      {error ? <p role="alert">Unable to load activities.</p>
        : activities === null ? <p role="status">Loading activities...</p>
          : activities.length === 0 ? <p role="status">No activities yet.</p>
            : <ul>{activities.map((activity, index) => <li key={`${activity.type}-${index}`}>
              {activity.type}: {activity.minutes} minutes, {activity.points} points
            </li>)}</ul>}
    </CapabilityCard>
  );
}
