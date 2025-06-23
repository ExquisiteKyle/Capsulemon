"use client";

import Modal from "@/components/common/Modal";
import styles from "./CreateCardModal.module.css";

export default function CreateCardModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  elements,
  error,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Card"
      showActions={false}
    >
      <form onSubmit={handleSubmit} className={styles.createForm}>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            required
            placeholder="Enter card name"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Rarity:</label>
          <select
            name="rarity"
            value={formData.rarity}
            onChange={onInputChange}
            required
          >
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Element:</label>
          <select
            name="element_id"
            value={formData.element_id}
            onChange={onInputChange}
            required
          >
            <option value="">Select Element</option>
            {elements.map((element) => (
              <option key={element.id} value={element.id}>
                {element.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Power:</label>
          <input
            type="number"
            name="power"
            value={formData.power}
            onChange={onInputChange}
            required
            min="0"
            placeholder="Enter power value"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Image URL:</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={onInputChange}
            placeholder="Enter image URL (optional)"
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button type="submit" className={styles.saveButton}>
            Create Card
          </button>
        </div>
      </form>
    </Modal>
  );
}
