"use client";

import styles from "./CardsHeader.module.css";

const CardsHeader = ({ username, totalCards, uniqueRarities }) => {
  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>Card Administration Panel</h1>
        <p className={styles.adminInfo}>Logged in as: {username}</p>
      </div>
      <div className={styles.stats}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Cards</span>
          <span className={styles.statValue}>{totalCards}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Unique Rarities</span>
          <span className={styles.statValue}>{uniqueRarities}</span>
        </div>
      </div>
    </div>
  );
};

export default CardsHeader;
