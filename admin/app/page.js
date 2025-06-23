"use client";

import { useAuth } from "@/context/AuthContext";
import { AdminLoginForm, AdminDashboard } from "@/components/dashboard";
import styles from "./styles.module.css";

export default function AdminHome() {
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

  if (isLoggedIn && isAdmin) {
    return <AdminDashboard username={authUsername} />;
  }

  return <AdminLoginForm onLogin={login} error={error} />;
}
