"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        router.push("/"); // Redirect to home page after successful login
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <video
        key="login-background-video"
        className={styles.videoBackground}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/videos/bg_vid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className={styles.videoOverlay}></div>

      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h1>Login</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className={styles.registerLink}>
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className={styles.linkButton}
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
