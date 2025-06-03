import { useState } from "react";
import styles from "../../styles/ManagePacks.module.css";

const PackCard = ({
  pack,
  onEdit,
  onDelete,
  onManageCards,
  onSave,
  onCancel,
  isEditing,
  editFormData,
  onInputChange,
}) => {
  if (isEditing) {
    return (
      <form onSubmit={onSave} className={styles.editForm}>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={editFormData.name}
            onChange={onInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Cost:</label>
          <input
            type="number"
            name="cost"
            value={editFormData.cost}
            onChange={onInputChange}
            required
            min="0"
          />
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton}>
            Save
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className={styles.packHeader}>
        <h2 className={styles.packName}>{pack.name}</h2>
        <div className={styles.packCost}>{pack.cost} coins</div>
      </div>
      <div className={styles.cardCount}>
        {pack.card_count || 0} cards in pack
      </div>
      <div className={styles.packActions}>
        <button
          className={styles.manageCardsButton}
          onClick={() => onManageCards(pack.id)}
        >
          Manage Cards
        </button>
        <button className={styles.editButton} onClick={() => onEdit(pack)}>
          Edit
        </button>
        <button className={styles.deleteButton} onClick={() => onDelete(pack)}>
          Delete
        </button>
      </div>
    </>
  );
};

export default PackCard;
