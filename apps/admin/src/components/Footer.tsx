import React, { JSX } from "react";

export default function Footer(): JSX.Element {
  const year = new Date().getFullYear();
  return (
    <footer style={footerStyle}>
      <div style={footerInner}>
        <div style={{ color: "#666", fontSize: 13 }}>
          © {year} DiscoverGroup — Admin panel
        </div>
        <div style={{ color: "#666", fontSize: 13 }}>Built with ❤️</div>
      </div>
    </footer>
  );
}

const footerStyle: React.CSSProperties = {
  borderTop: "1px solid #eee",
  marginTop: 28,
  background: "#fff",
};

const footerInner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "16px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};