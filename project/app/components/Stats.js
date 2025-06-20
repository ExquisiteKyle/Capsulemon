"use client";

import styles from "./Stats.module.css";

export default function Stats({ ownedCards, totalCards }) {
  const uniqueCards = ownedCards.length;
  const totalQuantity = ownedCards.reduce(
    (sum, card) => sum + card.quantity,
    0
  );

  const rarityCounts = ownedCards.reduce((counts, card) => {
    const rarity = card.rarity.toLowerCase();
    counts[rarity] = (counts[rarity] || 0) + card.quantity;
    return counts;
  }, {});

  const elementCounts = ownedCards.reduce((counts, card) => {
    const element = card.element_name.toLowerCase();
    counts[element] = (counts[element] || 0) + card.quantity;
    return counts;
  }, {});

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.statsTitle}>Your Collection Stats</h2>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{uniqueCards}</div>
          <div className={styles.statLabel}>Unique Cards</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalQuantity}</div>
          <div className={styles.statLabel}>Total Cards</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalCards}</div>
          <div className={styles.statLabel}>Available Cards</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {totalCards > 0 ? Math.round((uniqueCards / totalCards) * 100) : 0}%
          </div>
          <div className={styles.statLabel}>Completion</div>
        </div>
      </div>

      {Object.keys(rarityCounts).length > 0 && (
        <div className={styles.detailedStats}>
          <h3 className={styles.sectionTitle}>Cards by Rarity</h3>
          <div className={styles.rarityGrid}>
            {Object.entries(rarityCounts).map(([rarity, count]) => (
              <div key={rarity} className={styles.rarityItem}>
                <span className={styles.rarityName}>{rarity}</span>
                <span className={styles.rarityCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(elementCounts).length > 0 && (
        <div className={styles.detailedStats}>
          <h3 className={styles.sectionTitle}>Cards by Element</h3>
          <div className={styles.elementGrid}>
            {Object.entries(elementCounts).map(([element, count]) => (
              <div key={element} className={styles.elementItem}>
                <span className={styles.elementName}>{element}</span>
                <span className={styles.elementCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
