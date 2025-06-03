"use client";

import Modal from "../../common/Modal";
import styles from "./DeletePackModal.module.css";

export default function DeletePackModal({
  isOpen,
  onClose,
  onConfirm,
  packName,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Pack"
      message={`Are you sure you want to delete the pack "${packName}"? This action cannot be undone.`}
      confirmText="Delete Pack"
      cancelText="Cancel"
      onConfirm={onConfirm}
    />
  );
}
