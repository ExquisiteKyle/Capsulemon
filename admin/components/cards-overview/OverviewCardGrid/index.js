"use client";

import styles from "./OverviewCardGrid.module.css";

const OverviewCardGrid = ({ cards }) => {
  if (cards.length === 0) {
    return (
      <div className={styles.noResults}>
        <p>No cards found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className={styles.cardGrid}>
      {cards.map((card) => (
        <div key={card.id} className={styles.cardItem}>
          <div className={styles.cardHeader}>
            <h2>{card.name}</h2>
            <div
              className={`${styles.rarity} ${
                styles[card.rarity.toLowerCase()] || ""
              }`}
            >
              {card.rarity}
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardInfo}>
              <p>
                <strong>Power:</strong> {card.power}
              </p>
              <p>
                <strong>Element:</strong> {card.element_name}
              </p>
            </div>
            {card.image_url && (
              <div className={styles.imageContainer}>
                <img
                  src={card.image_url}
                  alt={card.name}
                  className={styles.cardImage}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCardGrid;
