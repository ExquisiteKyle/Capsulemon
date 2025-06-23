"use client";

import styles from "./Card.module.css";

const Card = ({ card, quantity = 1, showQuantity = true }) => {
  const getRarityColor = (rarity) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "#9ca3af";
      case "uncommon":
        return "#10b981";
      case "rare":
        return "#3b82f6";
      case "epic":
        return "#8b5cf6";
      case "legendary":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getElementColor = (element) => {
    switch (element.toLowerCase()) {
      case "fire":
        return "#ef4444";
      case "water":
        return "#3b82f6";
      case "earth":
        return "#8b4513";
      case "wind":
        return "#10b981";
      case "dark":
        return "#1f2937";
      case "holy":
        return "#fbbf24";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardImage}>
        {card.image_url ? (
          <img src={card.image_url} alt={card.name} />
        ) : (
          <div className={styles.placeholderImage}>
            <span>{card.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className={styles.cardInfo}>
        <h3 className={styles.cardName}>{card.name}</h3>
        <div className={styles.cardStats}>
          <span
            className={styles.rarity}
            style={{ backgroundColor: getRarityColor(card.rarity) }}
          >
            {card.rarity}
          </span>
          <span
            className={styles.element}
            style={{ backgroundColor: getElementColor(card.element_name) }}
          >
            {card.element_name}
          </span>
          <span className={styles.power}>Power: {card.power}</span>
        </div>
        {showQuantity && quantity > 1 && (
          <div className={styles.quantity}>x{quantity}</div>
        )}
      </div>
    </div>
  );
};

export default Card;
