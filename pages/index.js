import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import Background from "../components/Background";
import { useAuth } from "../context/AuthContext"; // Import useAuth

const Home = () => {
  const router = useRouter();
  const [usernameInput, setUsernameInput] = useState(""); // Rename local state to avoid conflict
  const [passwordInput, setPasswordInput] = useState(""); // Rename local state to avoid conflict

  const {
    isLoggedIn,
    isAdmin,
    loading,
    error,
    username: authUsername,
    login,
    logout,
  } = useAuth(); // Get state and functions from AuthContext

  if (loading) {
    return <Background />;
  }

  if (isLoggedIn) router.push("/cards");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Use local input state
    const success = await login(usernameInput, passwordInput);

    if (success) {
      // Clear local form fields on successful login
      setUsernameInput("");
      setPasswordInput("");
      // No need to set isLoggedIn/isAdmin here, context handles it
    }
    // Error is handled by context and accessed via the hook
  };

  return (
    <div className={styles.container}>
      <Background />
      {/* Pass state and logout from context to Navbar */}
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />
      <h1 className={styles.title}>
        {/* Use username from AuthContext */}
        {isLoggedIn
          ? `Welcome, ${authUsername || "User"}!` // Use username from context
          : "Login"}
      </h1>

      {!isLoggedIn && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
          </div>
          {/* Use error from AuthContext */}
          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            Login
          </button>
        </form>
      )}
    </div>
  );
};

export default Home;
