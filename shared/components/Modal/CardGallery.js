"use client";

import styles from "./CardGallery.module.css";

export default function CardGallery({ cards, title }) {
  if (!cards || cards.length === 0) {
    return null;
  }

  // Create a more robust key generation function
  const generateKey = (card, index) => {
    // Try to use unique identifiers in order of preference
    if (card.card_id) return `card-${card.card_id}`;
    if (card.id) return `card-${card.id}`;
    if (card.card_name) return `card-${card.card_name}-${index}`;
    // Fallback to index with a unique prefix
    return `card-gallery-${index}`;
  };

  return (
    <div className={styles.cardSection}>
      <h4 className={styles.sectionTitle}>{title}</h4>
      <div className={styles.cardsGrid}>
        {cards.map((card, index) => (
          <div key={generateKey(card, index)} className={styles.cardItem}>
            <div className={styles.cardImageContainer}>
              {card.image_url ? (
                <img
                  src={card.image_url}
                  alt={card.card_name}
                  className={styles.cardImage}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
              ) : null}
              <div className={styles.cardImagePlaceholder}>
                <span className={styles.cardName}>{card.card_name}</span>
              </div>
            </div>
            <div className={styles.cardDetails}>
              <span className={styles.cardName}>{card.card_name}</span>
              <span
                className={`${styles.cardRarity} ${
                  styles[card.rarity.toLowerCase()]
                }`}
              >
                {card.rarity}
              </span>
              <span className={styles.cardElement}>{card.element_name}</span>
              {card.quantity && card.quantity > 1 && (
                <span className={styles.cardQuantity}>x{card.quantity}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
