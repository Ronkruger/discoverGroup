import React, { JSX } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar(): JSX.Element {
  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={brandStyle}>Admin UI</div>
          <nav style={{ display: "flex", gap: 12 }}>
            <NavLink to="/" end style={navLinkStyle}>
              Home
            </NavLink>
            <NavLink to="/tours" style={navLinkStyle}>
              Tours
            </NavLink>
            <NavLink to="/tours/create" style={navLinkStyle}>
              Create
            </NavLink>
          </nav>
        </div>

        <div style={{ color: "#666", fontSize: 13 }}>You're signed in</div>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  background: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 40,
};

const innerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  maxWidth: 1100,
  margin: "0 auto",
  padding: "12px 20px",
};

const brandStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 16,
};

const navLinkStyle = ({ isActive }: { isActive?: boolean }) =>
  ({
    color: isActive ? "crimson" : undefined,
    textDecoration: "none",
    padding: "6px 8px",
    borderRadius: 6,
  } as React.CSSProperties);