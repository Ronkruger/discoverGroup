import React from "react";

interface Props {
  title: string;
  value: string | number;
  hint?: string;
}

export default function StatCard({ title, value, hint }: Props): JSX.Element {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{value}</div>
      {hint ? <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>{hint}</div> : null}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 8,
  padding: 16,
  minWidth: 160,
  boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
};