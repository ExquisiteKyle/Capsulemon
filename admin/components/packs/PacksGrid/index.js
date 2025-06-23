"use client";

import PackCard from "../PackCard";
import styles from "./PacksGrid.module.css";

export default function PacksGrid({
  packs,
  onEdit,
  onDelete,
  onManageCards,
  onSave,
  onCancel,
  isEditing,
  editFormData,
  onInputChange,
}) {
  return (
    <div className={styles.packsGrid}>
      {packs.map((pack) => (
        <div key={pack.id} className={styles.pack}>
          <PackCard
            pack={pack}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageCards={onManageCards}
            onSave={onSave}
            onCancel={onCancel}
            isEditing={isEditing?.id === pack.id}
            editFormData={editFormData}
            onInputChange={onInputChange}
          />
        </div>
      ))}
    </div>
  );
}
