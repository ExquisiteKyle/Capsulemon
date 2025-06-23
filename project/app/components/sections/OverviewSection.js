"use client";

import Stats from "../Stats";
import Card from "../Card";
import styles from "../../page.module.css";

const OverviewSection = ({ ownedCards, totalCards }) => {
  return (
    <div className={styles.overviewContainer}>
      <Stats ownedCards={ownedCards} totalCards={totalCards} />

      <div className={styles.recentCards}>
        <h2>Recent Cards</h2>
        {ownedCards.length > 0 ? (
          <div className={styles.cardsGrid}>
            {ownedCards.slice(0, 6).map((card, index) => (
              <Card
                key={`recent-${card.id}-${index}`}
                card={card}
                quantity={card.quantity}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>
            You don't have any cards yet. Open some packs to get started!
          </p>
        )}
      </div>
    </div>
  );
};

export default OverviewSection;
