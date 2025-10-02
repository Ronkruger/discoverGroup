import { JSX, useEffect, useState } from "react";
import { fetchTours } from "../../services/apiClient";
import type { Tour } from "@discovergroup/types";

export default function ToursList(): JSX.Element {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchTours()
      .then((data) => {
        if (mounted) setTours(data);
      })
      .catch(() => {
        if (mounted) setTours([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ padding: 28 }}>
      <h2>Tours</h2>
      {loading ? <div>Loading…</div> : (
        <div>
          {tours.length === 0 ? <div>No tours yet.</div> : (
            <ul>
              {tours.map((t) => <li key={t.id}>{t.title} — {t.slug}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}