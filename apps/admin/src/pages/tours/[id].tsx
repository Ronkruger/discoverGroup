import React, { JSX, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTourById, updateTour } from "../../services/apiClient";

interface Tour {
  id: string;
  title: string;
  slug: string;
  // add other fields as needed
}

export default function EditTour(): JSX.Element {
  const { id } = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    fetchTourById(id).then((t) => mounted && setTour(t)).catch(() => mounted && setTour(null));
    return () => { mounted = false; };
  }, [id]);

  if (!tour) return <div style={{ padding: 28 }}>Loading…</div>;

  return (
    <div style={{ padding: 28 }}>
      <h2>Edit tour</h2>
      <div style={{ marginBottom: 10 }}>
        <label>Title<br/><input value={tour.title} onChange={(e) => setTour({ ...tour, title: e.target.value })} /></label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Slug<br/><input value={tour.slug} onChange={(e) => setTour({ ...tour, slug: e.target.value })} /></label>
      </div>
      <div>
        <button
          onClick={async () => {
            setSaving(true);
            await updateTour(id!, {
              name: tour.title, // Map 'title' from Tour to 'name' in TourPayload
              description: "", // Provide a default or actual description if available
              // Add other fields as needed
            });
            setSaving(false);
            alert('Saved');
          }}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}