import React from "react";

const Footer: React.FC = () => (
  <footer style={{ padding: "1rem", background: "#222", color: "#fff", marginTop: "auto", textAlign: "center" }}>
    <small>&copy; {new Date().getFullYear()} CRM System. All rights reserved.</small>
  </footer>
);

export default Footer;