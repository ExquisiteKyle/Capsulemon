"use client";

import Modal from "./Modal.js";
import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonStyle = "primary",
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className={styles.content}>
        {message && <p className={styles.message}>{message}</p>}
      </div>
      <div className={styles.footer}>
        <button className={styles.cancelButton} onClick={onClose}>
          {cancelText}
        </button>
        <button
          className={`${styles.confirmButton} ${styles[confirmButtonStyle]}`}
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
