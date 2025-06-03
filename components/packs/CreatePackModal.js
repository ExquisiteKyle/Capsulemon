import Modal from "../Modal";
import styles from "../../styles/ManagePacks.module.css";

const CreatePackModal = ({
  isOpen,
  onClose,
  onCreate,
  packData,
  onInputChange,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Pack"
      showActions={false}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCreate();
        }}
      >
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={packData.name}
            onChange={onInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Cost:</label>
          <input
            type="number"
            name="cost"
            value={packData.cost}
            onChange={onInputChange}
            required
            min="0"
          />
        </div>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className={styles.saveButton}>
            Create Pack
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePackModal;
