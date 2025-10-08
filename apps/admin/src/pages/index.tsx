import React from "react";
// removed unused type import

export default function AdminDashboard(): React.ReactElement {
  return (
    <div style={{ padding: 28, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 12 }}>DiscoverGroup — Admin</h1>
      <p style={{ marginBottom: 20, color: "#334155" }}>Dashboard (scaffold). Use the left nav to manage content and reports.</p>

      <ul>
        <li><a href="/tours">Tours (CRUD)</a></li>
        <li><a href="/transactions">Transactions</a></li>
        <li><a href="/reports">Reports</a></li>
        <li><a href="/design">Design / Theme Editor</a></li>
      </ul>
    </div>
  );
}