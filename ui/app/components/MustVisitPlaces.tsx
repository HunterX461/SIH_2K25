import React, { useEffect, useState } from "react";
import api from "../services/apiService"; // adjust path if necessary

type Place = {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  category?: string;
  image_url?: string;
};

export function MustVisitPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Place | null>(null);

  useEffect(() => {
    let mounted = true;
    api.get("/places")
      .then((res) => {
        if (mounted) setPlaces(res || []);
      })
      .catch(() => setError("Failed to load places"))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  function showOnMap(p: Place) {
    // map component listens for this event to center and open popup
    window.dispatchEvent(new CustomEvent("centerMapOnPlace", { detail: p }));
    setSelected(p);
  }

  if (loading) return <div>Loading must-visit places…</div>;
  if (error) return <div>{error}</div>;

  return (
    <section>
      <h3>Must Visit Places</h3>
      <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
        {places.map((p) => (
          <article key={p.id} style={{ minWidth: 240, border: "1px solid #ddd", padding: 8 }}>
            {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 120, objectFit: "cover" }} />}
            <h4>{p.name}</h4>
            <p style={{ fontSize: 13, color: "#555" }}>{p.description}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => showOnMap(p)}>Show on map</button>
              <button onClick={() => setSelected(p)}>Details</button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <dialog open style={{ padding: 20 }}>
          <h4>{selected.name}</h4>
          <p>{selected.description}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => showOnMap(selected)}>Show on map</button>
            <button onClick={() => setSelected(null)}>Close</button>
          </div>
        </dialog>
      )}
    </section>
  );
}

export default MustVisitPlaces;
