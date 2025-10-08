import React, { useState } from "react";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: "2rem auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Login</h2>
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
        <label>Password</label>
        <input
          type="password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
      </div>
      <button type="submit" style={{ width: "100%", padding: 10, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4 }}>Login</button>
    </form>
  );
};

export default LoginForm;