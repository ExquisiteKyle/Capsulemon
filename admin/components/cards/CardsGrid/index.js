"use client";

import CardItem from "../CardItem";
import styles from "./CardsGrid.module.css";

export default function CardsGrid({
  cards,
  elements,
  editingCard,
  editFormData,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onInputChange,
  deletingCard,
}) {
  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          elements={elements}
          onEdit={onEdit}
          onDelete={onDelete}
          onSave={onSave}
          onCancel={onCancel}
          isEditing={editingCard?.id === card.id}
          editFormData={editFormData}
          onInputChange={onInputChange}
          isDeleting={deletingCard === card.id}
          isDisabled={
            !!editingCard || (deletingCard && deletingCard !== card.id)
          }
        />
      ))}
    </div>
  );
}
