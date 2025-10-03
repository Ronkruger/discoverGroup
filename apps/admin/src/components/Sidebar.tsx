import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar(): JSX.Element {
  return (
    <aside className="sidebar" aria-label="Admin navigation">
      <div className="brand">Admin UI</div>

      <nav>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>

        <NavLink to="/tours" className={({ isActive }) => (isActive ? "active" : "")}>
          Tours
        </NavLink>

        <NavLink to="/tours/create" className={({ isActive }) => (isActive ? "active" : "")}>
          Create
        </NavLink>

        <NavLink to="#" onClick={(e) => e.preventDefault()}>
          Settings
        </NavLink>

        <NavLink to="#" onClick={(e) => e.preventDefault()}>
          Integrations
        </NavLink>
      </nav>
    </aside>
  );
}