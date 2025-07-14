"use client";

import Card from "../Card";
import styles from "../../page.module.css";

const CollectionSection = ({ ownedCards, onSwitchToPacks }) => {
  return (
    <div className={styles.collectionContainer}>
      <h2>Your Card Collection</h2>
      {ownedCards.length > 0 ? (
        <div className={styles.cardsGrid}>
          {ownedCards.map((card, index) => (
            <Card
              key={`collection-${card.id}-${index}`}
              card={card}
              quantity={card.quantity}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyMessage}>
            Your collection is empty. Open some packs to get cards!
          </p>
          <button className={styles.openPacksButton} onClick={onSwitchToPacks}>
            Browse Packs
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectionSection;
