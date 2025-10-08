import React, { useState } from "react";

interface RegisterFormProps {
  onRegister: (form: { username: string; email: string; password: string; fullName: string }) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }
    onRegister({ username, email, password, fullName });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "2rem auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Register</h2>
      <div style={{ marginBottom: 16 }}>
        <label>Full Name</label>
        <input
          type="text"
          value={fullName}
          required
          onChange={e => setFullName(e.target.value)}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Username</label>
        <input
          type="text"
          value={username}
          required
          onChange={e => setUsername(e.target.value)}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Password</label>
        <input
          type="password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Confirm Password</label>
        <input
          type="password"
          value={confirm}
          required
          onChange={e => setConfirm(e.target.value)}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
      </div>
      <button type="submit" style={{ width: "100%", padding: 10, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4 }}>Register</button>
    </form>
  );
};

export default RegisterForm;