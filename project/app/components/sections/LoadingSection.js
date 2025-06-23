"use client";

import styles from "../../page.module.css";

const LoadingSection = ({
  message = "Loading...",
  showHeader = false,
  username = "",
  credits = 0,
  onLogout,
}) => {
  return (
    <div className={styles.container}>
      {showHeader && (
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome, {username}!</h1>
          <div className={styles.headerActions}>
            <span className={styles.credits}>Credits: {credits}</span>
            <button onClick={onLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      )}
      <div className={styles.loadingContainer}>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSection;
