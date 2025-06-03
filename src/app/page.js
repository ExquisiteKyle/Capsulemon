"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import Background from "@/components/common/Background";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const {
    isLoggedIn,
    loading,
    error,
    username: authUsername,
    login,
  } = useAuth();

  if (loading) {
    return <Background />;
  }

  if (isLoggedIn) {
    router.push("/cards");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(usernameInput, passwordInput);

    if (success) {
      setUsernameInput("");
      setPasswordInput("");
    }
  };

  return (
    <div className={styles.container}>
      <Background />
      <h1 className={styles.title}>
        {isLoggedIn ? `Welcome, ${authUsername || "User"}!` : "Login"}
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
          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            Login
          </button>
        </form>
      )}
    </div>
  );
}
