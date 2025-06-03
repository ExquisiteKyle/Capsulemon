"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { useAuth } from "@/context/AuthContext";

export default function AdminHome() {
  const router = useRouter();
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const {
    isLoggedIn,
    loading,
    error,
    username: authUsername,
    isAdmin,
    login,
  } = useAuth();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(usernameInput, passwordInput);

    if (success) {
      setUsernameInput("");
      setPasswordInput("");
    }
  };

  if (isLoggedIn && isAdmin) {
    return (
      <div className={styles.adminPageWrapper}>
        <div className={styles.adminDashboard}>
          <div className={styles.dashboardHeader}>
            <div className={styles.welcomeSection}>
              <h1>Admin Dashboard</h1>
              <p className={styles.welcomeMessage}>
                Welcome back, {authUsername}!
              </p>
            </div>
            <div className={styles.adminInfo}>
              <span className={styles.statusBadge}>Administrator</span>
              <p className={styles.lastLogin}>
                Last login: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className={styles.quickStats}>
            <div className={styles.statCard}>
              <h3>Quick Actions</h3>
              <div className={styles.actionButtons}>
                <button
                  onClick={() => router.push("/admin/manage-cards")}
                  className={styles.actionButton}
                >
                  Manage Cards
                </button>
                <button
                  onClick={() => router.push("/admin/manage-packs")}
                  className={styles.actionButton}
                >
                  Manage Packs
                </button>
                <button
                  onClick={() => router.push("/admin/pack-cards")}
                  className={styles.actionButton}
                >
                  Pack Cards
                </button>
              </div>
            </div>
          </div>

          <div className={styles.adminSections}>
            <div className={styles.section}>
              <h2>Card Management</h2>
              <p>
                Create, edit, and manage your card collection. Control card
                attributes, rarities, and more.
              </p>
              <button
                onClick={() => router.push("/admin/manage-cards")}
                className={styles.sectionButton}
              >
                Go to Card Management
              </button>
            </div>

            <div className={styles.section}>
              <h2>Pack Management</h2>
              <p>
                Configure and manage card packs. Set pack contents, prices, and
                availability.
              </p>
              <button
                onClick={() => router.push("/admin/manage-packs")}
                className={styles.sectionButton}
              >
                Go to Pack Management
              </button>
            </div>

            <div className={styles.section}>
              <h2>Pack Cards</h2>
              <p>
                Organize cards into packs. Create new pack combinations and
                manage existing ones.
              </p>
              <button
                onClick={() => router.push("/admin/pack-cards")}
                className={styles.sectionButton}
              >
                Go to Pack Cards
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1 className={styles.loginTitle}>Admin Login</h1>
          <p className={styles.loginSubtitle}>
            Please login to access the admin panel
          </p>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
