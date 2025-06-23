"use client";

import PackCardItem from "../PackCardItem";
import styles from "./PackCardsGrid.module.css";

export default function PackCardsGrid({
  packCards,
  editingCard,
  dropRate,
  onEditDropRate,
  onRemoveCard,
  onDropRateChange,
  onSaveDropRate,
  onCancelEdit,
}) {
  return (
    <div className={styles.grid}>
      {packCards.map((card) => (
        <PackCardItem
          key={card.card_id}
          card={card}
          onEditDropRate={onEditDropRate}
          onRemoveCard={onRemoveCard}
          isEditing={editingCard === card.card_id}
          dropRate={dropRate}
          onDropRateChange={onDropRateChange}
          onSaveDropRate={onSaveDropRate}
          onCancelEdit={onCancelEdit}
        />
      ))}
    </div>
  );
}
