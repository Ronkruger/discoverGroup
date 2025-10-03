import React, { JSX, useState } from "react";
import { createTour } from "../../services/apiClient";
import { useNavigate } from "react-router-dom";

export default function CreateTour(): JSX.Element {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await createTour({
        title,
        slug,
      });
      // navigate to list after create
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to create tour");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} style={{ maxWidth: 720 }}>
      <h2>Create tour</h2>
      <div style={{ marginBottom: 10 }}>
        <label>
          Title
          <br />
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Slug
          <br />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </label>
      </div>
      <button type="submit" disabled={saving}>{saving ? "Saving…" : "Create"}</button>
    </form>
  );
}