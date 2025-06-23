"use client";

import Modal from "@/components/common/Modal";

export default function DeleteCardModal({
  isOpen,
  onClose,
  onConfirm,
  cardName,
  isDeleting,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Card"
      message={`Are you sure you want to delete the card "${cardName}"?`}
      confirmText={isDeleting ? "Deleting..." : "Delete"}
      onConfirm={onConfirm}
      showCancel={true}
    />
  );
}
