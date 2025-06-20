"use client";

import Modal from "./Modal.js";
import CardGallery from "./CardGallery.js";
import styles from "./PackResultModal.module.css";

export default function PackResultModal({
  isOpen,
  onClose,
  packName,
  drawnCards,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pack Opened Successfully!"
      showCloseButton={true}
      closeOnOverlayClick={true}
    >
      <div className={styles.content}>
        <div className={styles.packInfo}>
          <h3 className={styles.packName}>{packName}</h3>
        </div>

        <CardGallery cards={drawnCards} title="New Cards Obtained:" />
      </div>

      <div className={styles.footer}>
        <button className={styles.closeModalButton} onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
