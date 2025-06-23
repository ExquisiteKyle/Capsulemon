"use client";

import styles from "./ManagePacksHeader.module.css";

export default function ManagePacksHeader({ onCreatePack }) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Manage Card Packs</h1>
      <div className={styles.actions}>
        <button className={styles.createButton} onClick={onCreatePack}>
          Create New Pack
        </button>
      </div>
    </div>
  );
}
