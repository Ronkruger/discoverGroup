import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import MainPage from "./components/MainPage";

type Page = "login" | "register" | "main";

const App: React.FC = () => {
  const [page, setPage] = useState<Page>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // These handlers should call your backend API
  const handleLogin = (username: string, password: string) => {
    // TODO: API call here
    // use the password parameter (kept for API call) to avoid unused variable errors
    void password;
    // store the current user so `username` is used
    setCurrentUser(username);
    setIsLoggedIn(true);
    setPage("main");
  };

  const handleRegister = (form: { username: string; email: string; password: string; fullName: string }) => {
    // TODO: API call here
    // use the form parameter (kept for API call) to avoid unused variable errors
    void form;
    alert("Registration successful!");
    setPage("login");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      {isLoggedIn ? (
        <>
          <div style={{ textAlign: "center", marginTop: 16 }}>Welcome, {currentUser ?? "User"}!</div>
          <MainPage />
        </>
      ) : (
        <>
          {page === "login" ? (
            <>
              <LoginForm onLogin={handleLogin} />
              <p style={{ textAlign: "center" }}>
                No account?{" "}
                <button style={{ color: "#1976d2", background: "none", border: "none", cursor: "pointer" }} onClick={() => setPage("register")}>
                  Register here
                </button>
              </p>
            </>
          ) : (
            <>
              <RegisterForm onRegister={handleRegister} />
              <p style={{ textAlign: "center" }}>
                Already have an account?{" "}
                <button style={{ color: "#1976d2", background: "none", border: "none", cursor: "pointer" }} onClick={() => setPage("login")}>
                  Login here
                </button>
              </p>
            </>
          )}
        </>
      )}
      <Footer />
    </div>
  );
};

export default App;