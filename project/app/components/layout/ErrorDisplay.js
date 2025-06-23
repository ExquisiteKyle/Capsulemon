"use client";

import styles from "../../page.module.css";

const ErrorDisplay = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <div className={styles.errorContainer}>
      <p>Error: {error}</p>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
