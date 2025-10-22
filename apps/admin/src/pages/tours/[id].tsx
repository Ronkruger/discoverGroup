import React, { JSX, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTourById, updateTour } from "../../services/apiClient";

interface Tour {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  durationDays?: number;
  isSaleEnabled?: boolean;
  saleEndDate?: string | null;
  regularPricePerPerson?: number;
  promoPricePerPerson?: number | null;
}

export default function EditTour(): JSX.Element {
  const { id } = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    fetchTourById(id)
      .then((t) => mounted && setTour(t ?? null))
      .catch(() => mounted && setTour(null));
    return () => { mounted = false; };
  }, [id]);

  if (!tour) return <div>Loading…</div>;

  return (
    <div style={{ maxWidth: 720 }}>
      <h2>Edit tour</h2>
      <div style={{ marginBottom: 10 }}>
        <label>
          Title
          <br />
          <input value={tour.title} onChange={(e) => setTour({ ...tour, title: e.target.value })} />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Slug
          <br />
          <input value={tour.slug} onChange={(e) => setTour({ ...tour, slug: e.target.value })} />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Summary
          <br />
          <input value={tour.summary ?? ""} onChange={(e) => setTour({ ...tour, summary: e.target.value })} />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Regular Price (PHP)
          <br />
          <input
            type="number"
            value={tour.regularPricePerPerson ?? ""}
            onChange={e => setTour({ ...tour, regularPricePerPerson: Number(e.target.value) })}
          />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Promo Price (PHP)
          <br />
          <input
            type="number"
            value={tour.promoPricePerPerson ?? ""}
            onChange={e => setTour({ ...tour, promoPricePerPerson: Number(e.target.value) })}
            disabled={!tour.isSaleEnabled}
          />
        </label>
      </div>
      {/* Sale Toggle */}
      <div style={{ marginBottom: 10 }}>
        <label>
          <input
            type="checkbox"
            checked={!!tour.isSaleEnabled}
            onChange={e => setTour({ ...tour, isSaleEnabled: e.target.checked })}
          />
          Enable Promo Price (Sale)
        </label>
      </div>
      {/* Sale End Date */}
      {tour.isSaleEnabled && (
        <div style={{ marginBottom: 10 }}>
          <label>
            Sale End Date
            <br />
            <input
              type="date"
              value={tour.saleEndDate ? tour.saleEndDate.slice(0, 10) : ""}
              onChange={e => setTour({ ...tour, saleEndDate: e.target.value })}
            />
          </label>
        </div>
      )}

      <div>
        <button
          onClick={async () => {
            setSaving(true);
            try {
              await updateTour(id!, {
                title: tour.title,
                slug: tour.slug,
                summary: tour.summary,
                regularPricePerPerson: tour.regularPricePerPerson,
                promoPricePerPerson: tour.promoPricePerPerson,
                isSaleEnabled: tour.isSaleEnabled,
                saleEndDate: tour.saleEndDate,
              });
              navigate("/");
            } catch (err) {
              console.error(err);
              alert("Save failed");
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}