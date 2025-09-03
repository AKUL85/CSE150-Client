import React from "react";
export default function Branding() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="32" fill="#ef4444"/>
        <path d="M16 48L48 16" stroke="white" strokeWidth="4"/>
      </svg>
      <h1 style={{ margin: 0, fontSize: 20 }}>Corruption Heatmap BD</h1>
    </div>
  );
}
