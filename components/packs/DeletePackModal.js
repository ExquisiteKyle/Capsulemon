import Modal from "../Modal";

const DeletePackModal = ({ isOpen, onClose, onConfirm, packName }) => {
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
};

export default DeletePackModal;
