import React, { useEffect, useState } from "react";
// Correct relative path: from app/(admin)/places.tsx -> app/services/apiService
import api from "../services/apiService";

export default function AdminPlaces() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "", description: "", latitude: "", longitude: "", category: "", image_url: ""
  });

  useEffect(() => {
    api.get("/places")
      .then((r) => { setPlaces(r || []); setLoading(false); })
      .catch((e) => { console.error("Failed to load places", e); setLoading(false); });
  }, []);

  const createPlace = async () => {
    try {
      const payload = {
        name: form.name,
        description: form.description,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        category: form.category,
        image_url: form.image_url
      };
      await api.post("/places", payload);
      const updated = await api.get("/places");
      setPlaces(updated || []);
      setForm({ name: "", description: "", latitude: "", longitude: "", category: "", image_url: "" });
    } catch (err: any) {
      console.error("Create failed", err);
      alert("Create failed: " + (err.message || "unknown"));
    }
  };

  return (
    <div>
      <h2>Manage Must-Visit Places</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 800 }}>
        <input placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
        <input placeholder="Latitude" value={form.latitude} onChange={(e)=>setForm({...form, latitude:e.target.value})} />
        <input placeholder="Longitude" value={form.longitude} onChange={(e)=>setForm({...form, longitude:e.target.value})} />
        <input placeholder="Image URL" value={form.image_url} onChange={(e)=>setForm({...form, image_url:e.target.value})} />
        <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} />
        <div>
          <button onClick={createPlace}>Create place</button>
        </div>
      </div>

      <hr />

      {loading ? <div>Loading…</div> : <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(places, null, 2)}</pre>}
    </div>
  );
}
