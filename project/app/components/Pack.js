"use client";

import styles from "./Pack.module.css";

export default function Pack({ pack, onOpen, userCredits = 0 }) {
  const hasEnoughCredits = userCredits >= pack.cost;

  return (
    <div
      className={`${styles.pack} ${!hasEnoughCredits ? styles.disabled : ""}`}
    >
      <div className={styles.packHeader}>
        <h3 className={styles.packName}>{pack.name}</h3>
        <div className={styles.packCost}>
          <span className={styles.costLabel}>Cost:</span>
          <span
            className={`${styles.costValue} ${
              !hasEnoughCredits ? styles.insufficient : ""
            }`}
          >
            {pack.cost}
          </span>
        </div>
      </div>
      <div className={styles.packInfo}>
        <p className={styles.packDescription}>
          Open this pack to get random cards with different rarities!
        </p>
        <button
          className={`${styles.openButton} ${
            !hasEnoughCredits ? styles.disabled : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasEnoughCredits) {
              onOpen(pack);
            }
          }}
          disabled={!hasEnoughCredits}
        >
          {hasEnoughCredits ? "Open Pack" : "Insufficient Credits"}
        </button>
      </div>
    </div>
  );
}
