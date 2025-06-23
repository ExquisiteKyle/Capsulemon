"use client";

import styles from "./CardsControls.module.css";

const CardsControls = ({
  searchTerm,
  onSearchChange,
  selectedRarity,
  onRarityChange,
  rarityOptions,
  onAddNew,
}) => {
  return (
    <div className={styles.controls}>
      <div className={styles.filterBox}>
        <input
          type="text"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={selectedRarity}
          onChange={(e) => onRarityChange(e.target.value)}
          className={styles.filterSelect}
        >
          {rarityOptions.map((rarity) => (
            <option key={rarity} value={rarity}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <button onClick={onAddNew} className={styles.addButton}>
        Add New Card
      </button>
    </div>
  );
};

export default CardsControls;
