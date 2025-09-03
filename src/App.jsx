import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import HeatmapLayer from "react-leaflet-heatmap-layer-v3";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import Branding from "./Branding";
import Dashboard from "./Dashboard";
import { submitReport, getReports, getStats, health } from "./api";

const DEFAULT_CENTER = [23.8103, 90.4125]; // Dhaka
const DEFAULT_ZOOM = 10;

export default function App() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ sector: "All" });
  const [form, setForm] = useState({
    sector: "",
    amount: "",
    description: "",
    city: "",
    location: { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] },
  });

  useEffect(() => {
    const boot = async () => {
      try {
        await health();
        const [r, s] = await Promise.all([getReports(), getStats()]);
        setReports(r.data || []);
        setStats(s.data || null);
      } catch (e) {
        setError("Could not fetch data from backend. Check API URL.");
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  const heatPoints = useMemo(
    () =>
      (reports || [])
        .filter((r) => (filters.sector === "All" ? true : r.sector === filters.sector))
        .map((r) => [
          r.location.lat,
          r.location.lng,
          Math.min(1, Math.max(0.2, (r.amount ? Number(r.amount) : 1) / 1000)),
        ]),
    [reports, filters]
  );

  const sectors = useMemo(() => {
    const s = new Set(["All"]);
    (reports || []).forEach((r) => r.sector && s.add(r.sector));
    return Array.from(s);
  }, [reports]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        sector: form.sector || "Unknown",
        amount: form.amount || null,
        description: form.description || "",
        city: form.city || "",
        location: form.location,
      };
      await submitReport(payload);
      const r = await getReports();
      setReports(r.data || []);
      setForm({ ...form, description: "", amount: "" });
    } catch (e) {
      setError("Submit failed. Check backend/API CORS.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div className="app">
      <div className="sidebar">
        <Branding />
        <h2 style={{ marginTop: 0 }}>Anonymous Corruption Heatmap</h2>
        <p>Submit a report anonymously. No personal info collected.</p>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 10, borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <select
            className="select"
            value={form.sector}
            onChange={(e) => setForm({ ...form, sector: e.target.value })}
          >
            <option value="">Select sector</option>
            <option>Police</option>
            <option>Health</option>
            <option>Land Office</option>
            <option>Education</option>
            <option>Customs</option>
            <option>Other</option>
          </select>

          <input
            className="input"
            placeholder="City (optional)"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          <input
            className="input"
            placeholder="Amount (optional, number)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <textarea
            className="textarea"
            placeholder="Short description…"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div style={{ marginBottom: 10, fontSize: 12, opacity: 0.8 }}>
            Location (drag map & click "Use Map Center"):
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button type="button" className="button" onClick={() => {
              // no-op, map center is controlled below via ref alternative kept simple
              alert("Pan/zoom the map, then click 'Use Map Center' below the map.");
            }}>How?</button>
          </div>

          <button className="button" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Report"}
          </button>
        </form>

        <hr style={{ margin: "16px 0" }} />

        <div>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Filters</div>
          <select
            className="select"
            value={filters.sector}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {stats && (
          <div style={{ marginTop: 16 }}>
            <div className="badge">Total reports: {stats.total_reports}</div>
            <div className="badge">Avg bribe: {stats.avg_amount}</div>
          </div>
        )}
      
        <Dashboard />
</div>

      <MapView reports={reports} heatPoints={heatPoints} form={form} setForm={setForm} />
    </div>
  );
}

function MapView({ reports, heatPoints, form, setForm }) {
  const [center, setCenter] = useState(DEFAULT_CENTER);

  return (
    <div style={{ position: "relative" }}>
      <div className="map">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          whenReady={(m) => setCenter(m.target.getCenter())}
          whenCreated={(m) => {
            m.on("moveend", () => setCenter(m.getCenter()));
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <HeatmapLayer
            fitBoundsOnLoad
            fitBoundsOnUpdate
            points={heatPoints.map((p) => ({ lat: p[0], lng: p[1], intensity: p[2] }))}
            longitudeExtractor={(p) => p.lng}
            latitudeExtractor={(p) => p.lat}
            intensityExtractor={(p) => p.intensity}
            radius={25}
            blur={20}
            max={1.0}
          />
          {reports.map((r) => (
            <CircleMarker
              key={r.id}
              center={[r.location.lat, r.location.lng]}
              radius={8}
            >
              <Popup>
                <div style={{ fontSize: 12 }}>
                  <div><b>Sector:</b> {r.sector}</div>
                  {r.city ? <div><b>City:</b> {r.city}</div> : null}
                  {r.amount ? <div><b>Amount:</b> {r.amount}</div> : null}
                  {r.description ? <div style={{ marginTop: 6 }}>{r.description}</div> : null}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="legend">
        <div style={{ marginBottom: 6 }}><b>Map Center:</b> {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</div>
        <button
          className="button"
          onClick={() =>
            setForm({ ...form, location: { lat: center.lat, lng: center.lng } })
          }
        >
          Use Map Center
        </button>
      </div>
    </div>
  );
}
