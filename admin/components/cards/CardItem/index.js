"use client";

import { useState } from "react";
import styles from "./CardItem.module.css";

export default function CardItem({
  card,
  elements,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  isEditing,
  editFormData,
  onInputChange,
  isDeleting,
  isDisabled,
}) {
  const handleEdit = () => {
    onEdit(card);
  };

  const handleDelete = () => {
    onDelete(card);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(e);
  };

  if (isEditing) {
    return (
      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.editForm}>
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
            <label>Rarity:</label>
            <select
              name="rarity"
              value={editFormData.rarity}
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
              value={editFormData.element_id}
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
              value={editFormData.power}
              onChange={onInputChange}
              required
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Image URL:</label>
            <input
              type="url"
              name="image_url"
              value={editFormData.image_url}
              onChange={onInputChange}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <h3>{card.name}</h3>
        <p>Rarity: {card.rarity}</p>
        <p>Element: {card.element_name}</p>
        <p>Power: {card.power}</p>
        {card.image_url && (
          <img
            src={card.image_url}
            alt={card.name}
            className={styles.cardImage}
          />
        )}
      </div>
      <div className={styles.cardActions}>
        <button
          onClick={handleEdit}
          className={styles.editButton}
          disabled={isDisabled}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className={styles.deleteButton}
          disabled={isDisabled}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
