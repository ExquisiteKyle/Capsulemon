"use client";

import styles from "./PackCardItem.module.css";

export default function PackCardItem({
  card,
  onEditDropRate,
  onRemoveCard,
  isEditing,
  dropRate,
  onDropRateChange,
  onSaveDropRate,
  onCancelEdit,
}) {
  const handleEditClick = () => {
    onEditDropRate(card.card_id, card.drop_rate.toString());
  };

  const handleRemoveClick = () => {
    onRemoveCard(card.card_id);
  };

  const handleSaveClick = () => {
    onSaveDropRate(card.card_id, dropRate);
  };

  const handleCancelClick = () => {
    onCancelEdit();
  };

  return (
    <div className={styles.pack}>
      <div className={styles.packHeader}>
        <h2 className={styles.packName}>{card.card_name}</h2>
        <div
          className={`${styles.rarity} ${styles[card.rarity.toLowerCase()]}`}
        >
          {card.rarity}
        </div>
      </div>

      {card.image_url && (
        <div className={styles.imageWrapper}>
          <img
            src={card.image_url}
            alt={card.card_name}
            className={styles.cardImage}
          />
        </div>
      )}

      <div className={styles.cardInfo}>
        {card.element_name} | Power: {card.power}
      </div>

      {isEditing ? (
        <div className={styles.editDropRate}>
          <input
            type="number"
            value={dropRate}
            onChange={(e) => onDropRateChange(e.target.value)}
            step="0.01"
            min="0"
            max="100"
            required
            className={styles.dropRateInput}
          />
          <div className={styles.editActions}>
            <button className={styles.saveButton} onClick={handleSaveClick}>
              Save
            </button>
            <button className={styles.cancelButton} onClick={handleCancelClick}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.dropRate}>
          Drop Rate: {card.drop_rate}%
          <div className={styles.packActions}>
            <button className={styles.editButton} onClick={handleEditClick}>
              Edit Rate
            </button>
            <button className={styles.deleteButton} onClick={handleRemoveClick}>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
