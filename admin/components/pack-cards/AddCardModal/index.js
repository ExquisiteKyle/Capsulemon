"use client";

import Modal from "@/components/common/Modal";
import styles from "./AddCardModal.module.css";

export default function AddCardModal({
  isOpen,
  onClose,
  onAddCard,
  selectedCard,
  onCardSelect,
  dropRate,
  onDropRateChange,
  availableCards,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCard && dropRate) {
      onAddCard();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Card to Pack"
      showActions={false}
    >
      <div className={styles.modalContent}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Card:</label>
            <select
              value={selectedCard?.id || ""}
              onChange={(e) => {
                const card = availableCards.find(
                  (c) => c.id === parseInt(e.target.value)
                );
                onCardSelect(card);
              }}
              required
              className={styles.cardSelect}
            >
              <option value="">Select a card</option>
              {availableCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} ({card.rarity})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Drop Rate (%):</label>
            <input
              type="number"
              value={dropRate}
              onChange={(e) => onDropRateChange(e.target.value)}
              step="0.01"
              min="0"
              max="100"
              required
              className={styles.dropRateInput}
              placeholder="Enter drop rate"
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={!selectedCard || !dropRate}
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
