import React, { useEffect, useState } from "react";
import { fetchTours, type Tour } from "../../services/apiClient";
import { Link } from "react-router-dom";

export default function ToursList(): JSX.Element {
  const [tours, setTours] = useState<Tour[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchTours()
      .then((data) => {
        if (!mounted) return;
        setTours(data);
        setError(null);
      })
      .catch((err) => {
        console.error("fetchTours error", err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load tours");
        setTours([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading tours…</div>;
  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;
  if (!tours || tours.length === 0)
    return (
      <div>
        <div style={{ marginBottom: 12 }}>No tours found.</div>
        <Link to="/tours/create">
          <button>Create first tour</button>
        </Link>
      </div>
    );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2>Tours</h2>
        <Link to="/tours/create">
          <button>Create Tour</button>
        </Link>
      </div>

      <ul style={{ paddingLeft: 0, listStyle: "none" }}>
        {tours.map((t) => (
          <li key={t.id} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.title ?? t.slug}</div>
                <div style={{ color: "#666", fontSize: 13 }}>
                  <code>{t.slug}</code> — {t.durationDays ?? "-"} days
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link to={`/tours/${t.id}`}>
                  <button> Edit </button>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}