import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import StatCard from "../components/StatCard";
import RecentTours from "../components/RecentTours";
import { fetchTours, type Tour } from "../services/apiClient";
import { Link } from "react-router-dom";

export default function Home(): JSX.Element {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchTours()
      .then((data) => {
        if (!mounted) return;
        setTours(data ?? []);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError(err?.message ?? "Failed to load tours");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const total = tours.length;
  const published = tours.filter((t) => (t as any).published).length; // optional if you have published flag

  return (
    <div>
      <Hero />
      <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginTop: 0 }}>Admin Dashboard</h2>
            <p style={{ color: "#444", marginTop: 6 }}>
              Manage tours, pricing and content. Quick links and recent items are available below.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <StatCard title="Total tours" value={loading ? "…" : total} hint="All tours in the system" />
              <StatCard title="Published" value={loading ? "…" : published} hint="Tours visible to users" />
              <div style={{ minWidth: 220 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to="/tours/create">
                    <button style={{ padding: "10px 14px", borderRadius: 8 }}>Create new tour</button>
                  </Link>
                  <Link to="/tours">
                    <button style={{ padding: "10px 14px", borderRadius: 8, background: "#eee", color: "#111", border: "none" }}>
                      View all tours
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 26 }}>
              {error ? <div style={{ color: "crimson" }}>Error: {error}</div> : null}
              <div style={{ marginTop: 8 }}>
                {/* TS: RecentTours props don't match compiled type, spread as any to satisfy TS for now */}
                <RecentTours {...({ tours } as any)} />
              </div>
            </div>
          </div>

          <aside style={{ width: 280 }}>
            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>Quick actions</div>
              <div style={{ display: "grid", gap: 8 }}>
                <Link to="/tours/create">
                  <button style={{ width: "100%", padding: "8px 10px", borderRadius: 6 }}>New tour</button>
                </Link>
                <button style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#fff", border: "1px solid #eee" }}>
                  Import tours (stub)
                </button>
                <button style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#fff", border: "1px solid #eee" }}>
                  Sync with external
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}