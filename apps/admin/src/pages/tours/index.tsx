// Updated ToursList with Delete button wired to services/apiClient.deleteTour

import { Tour } from "@discovergroup/types";
import { JSX, useEffect, useState } from "react";
import { fetchTours, deleteTour } from "../../services/apiClient";
import { Link } from "react-router-dom";

export default function ToursList(): JSX.Element {
  const [tours, setTours] = useState<Tour[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

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

  async function handleDelete(id: string | number) {
    const ok = window.confirm("Are you sure you want to delete this tour? This action cannot be undone.");
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteTour(id);
      // remove from local state
      setTours(prev => (prev ? prev.filter(t => `${t.id}` !== `${id}`) : prev));
    } catch (err) {
      console.error("Delete failed", err);
      alert(err instanceof Error ? err.message : "Failed to delete tour");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <div style={{ padding: 32 }}>Loading tours…</div>;
  if (error) return <div style={{ color: "crimson", padding: 32 }}>Error: {error}</div>;
  if (!tours || tours.length === 0)
    return (
      <div style={{ padding: 32 }}>
        <div style={{ marginBottom: 12 }}>No tours found.</div>
        <Link to="/tours/create">
          <button style={createBtnStyle}>Create first tour</button>
        </Link>
      </div>
    );

  return (
    <div style={{
      background: "#fff",
      margin: "40px auto",
      borderRadius: 12,
      boxShadow: "0 2px 16px 0 rgba(30,30,60,.08)",
      maxWidth: 1100,
      padding: "32px 30px"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 22
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Tours</h2>
        <Link to="/tours/create">
          <button style={createBtnStyle}>+ Create Tour</button>
        </Link>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          borderRadius: 10,
          overflow: "hidden",
          fontSize: 15,
        }}>
          <thead>
            <tr style={{ background: "#faf7fa" }}>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Slug</th>
              <th style={thStyle}>Line</th>
              <th style={thStyle}>Duration</th>
              <th style={thStyle}>Regular Price</th>
              <th style={thStyle}>Promo Price</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id} style={{ background: "#fff" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div style={{ color: "#888", fontSize: 13, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.summary}
                  </div>
                </td>
                <td style={tdStyle}><code>{t.slug}</code></td>
                <td style={tdStyle}>{t.line}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{t.durationDays ?? "-"}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {t.regularPricePerPerson ? `₱${t.regularPricePerPerson.toLocaleString()}` : "--"}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {t.promoPricePerPerson ? `₱${t.promoPricePerPerson.toLocaleString()}` : "--"}
                </td>
                <td style={{ ...tdStyle, minWidth: 160 }}>
                  <Link to={`/tours/${t.id}`}>
                    <button style={editBtnStyle}>Edit</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    style={{
                      ...deleteBtnStyle,
                      opacity: deletingId === t.id ? 0.6 : 1,
                      cursor: deletingId === t.id ? "not-allowed" : "pointer"
                    }}
                    aria-label={`Delete tour ${t.title}`}
                  >
                    {deletingId === t.id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  background: "#f6f6fa",
  fontWeight: 700,
  borderBottom: "1px solid #eee"
};
const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #f2f2f2",
  fontSize: 15,
  verticalAlign: "top"
};
const createBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 6,
  border: "none",
  background: "linear-gradient(90deg,#ee4d7e 0,#ff6a3d 100%)",
  color: "#fff",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer"
};
const editBtnStyle: React.CSSProperties = {
  padding: "7px 16px",
  borderRadius: 6,
  border: "none",
  fontWeight: 600,
  background: "linear-gradient(90deg,#ee4d7e 0,#ff6a3d 100%)",
  color: "#fff",
  cursor: "pointer",
  marginRight: 8,
};
const deleteBtnStyle: React.CSSProperties = {
  padding: "7px 12px",
  borderRadius: 6,
  border: "none",
  fontWeight: 600,
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer",
};