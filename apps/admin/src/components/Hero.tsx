import React from "react";

export default function Hero(): JSX.Element {
  return (
    <section style={heroWrap}>
      <div style={heroInner}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Admin Dashboard</h1>
        <p style={{ marginTop: 8, color: "#444" }}>
          Manage tours, pricing and content. Quick links below let you create and edit tours.
        </p>
      </div>
    </section>
  );
}

const heroWrap: React.CSSProperties = {
  background: "linear-gradient(90deg, #f7fafc 0%, #ffffff 100%)",
  borderBottom: "1px solid #eee",
  padding: "28px 0",
};

const heroInner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 20px",
};