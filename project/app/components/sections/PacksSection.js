"use client";

import Pack from "../Pack";
import styles from "../../page.module.css";

const PacksSection = ({ packs, onPackOpen, userCredits }) => {
  return (
    <div className={styles.packsContainer}>
      <h2>Available Packs</h2>
      {packs.length > 0 ? (
        <div className={styles.packsGrid}>
          {packs.map((pack) => (
            <Pack
              key={pack.id}
              pack={pack}
              onOpen={onPackOpen}
              userCredits={userCredits}
            />
          ))}
        </div>
      ) : (
        <p className={styles.emptyMessage}>No packs are currently available.</p>
      )}
    </div>
  );
};

export default PacksSection;
