import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet.heat";

export default function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create heat layer
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 20,
      max: 1.0,
    }).addTo(map);

    // Cleanup when component unmounts or points change
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}
