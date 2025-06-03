import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/ManageCards.module.css";
import Navbar from "../../components/Navbar";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAllCards,
  fetchElements,
  updateCard,
  deleteCard,
  createCard,
} from "../../utils/api";

const ManageCards = () => {
  const [cards, setCards] = useState([]);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [deletingCard, setDeletingCard] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    rarity: "common",
    element_id: "",
    power: "",
    image_url: "",
  });
  const router = useRouter();
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isLoggedIn || !isAdmin)) {
      router.push("/");
    }
  }, [authLoading, isLoggedIn, isAdmin, router]);

  // Fetch cards and elements data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cardsResponse, elementsResponse] = await Promise.all([
          fetchAllCards(),
          fetchElements(),
        ]);

        if (!cardsResponse.ok || !elementsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [cardsData, elementsData] = await Promise.all([
          cardsResponse.json(),
          elementsResponse.json(),
        ]);

        setCards(cardsData);
        setElements(elementsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && isAdmin) {
      loadData();
    }
  }, [isLoggedIn, isAdmin]);

  const handleEdit = (card) => {
    setEditingCard(card);
    setEditFormData({
      name: card.name,
      rarity: card.rarity,
      element_id: card.element_id,
      power: card.power,
      image_url: card.image_url || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditFormData(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateCard(editingCard.id, editFormData);
      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      // Update the cards list with the edited card
      setCards(
        cards.map((card) =>
          card.id === editingCard.id
            ? {
                ...card,
                ...editFormData,
                element_name: elements.find(
                  (e) => e.id === parseInt(editFormData.element_id)
                ).name,
              }
            : card
        )
      );

      setEditingCard(null);
      setEditFormData(null);
    } catch (err) {
      console.error("Error updating card:", err);
      setError("Failed to update card");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (card) => {
    setSelectedCard(card);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCard) return;

    setDeletingCard(selectedCard.id);
    try {
      const response = await deleteCard(selectedCard.id);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete card");
      }

      // Remove the card from the list
      setCards(cards.filter((c) => c.id !== selectedCard.id));
    } catch (err) {
      console.error("Error deleting card:", err);
      setError(err.message);
    } finally {
      setDeletingCard(null);
      setShowDeleteModal(false);
      setSelectedCard(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createCard(createFormData);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create card");
      }

      const newCard = await response.json();
      // Add the new card to the list with element name
      const elementName = elements.find(
        (e) => e.id === parseInt(createFormData.element_id)
      ).name;
      setCards([{ ...newCard.card, element_name: elementName }, ...cards]);

      // Reset form and close modal
      setCreateFormData({
        name: "",
        rarity: "common",
        element_id: "",
        power: "",
        image_url: "",
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating card:", err);
      setError(err.message);
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (authLoading || loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
      <div className={styles.content}>
        <h1 className={styles.title}>Manage Cards</h1>
        <div className={styles.actions}>
          <button
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            Create New Card
          </button>
        </div>
        <div className={styles.cardsGrid}>
          {cards.map((card) => (
            <div key={card.id} className={styles.card}>
              {editingCard?.id === card.id ? (
                <form onSubmit={handleEditSubmit} className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label>Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Rarity:</label>
                    <select
                      name="rarity"
                      value={editFormData.rarity}
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      required
                    >
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
                      onChange={handleInputChange}
                      required
                      min="1"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Image URL:</label>
                    <input
                      type="url"
                      name="image_url"
                      value={editFormData.image_url}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.editActions}>
                    <button type="submit" className={styles.saveButton}>
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardName}>{card.name}</h3>
                    <span className={`${styles.rarity} ${styles[card.rarity]}`}>
                      {card.rarity}
                    </span>
                  </div>
                  {card.image_url && (
                    <img
                      src={card.image_url}
                      alt={card.name}
                      className={styles.cardImage}
                    />
                  )}
                  <div className={styles.cardDetails}>
                    <p>Element: {card.element_name}</p>
                    <p>Power: {card.power}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleEdit(card)}
                      className={styles.editButton}
                      disabled={deletingCard === card.id}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(card)}
                      className={styles.deleteButton}
                      disabled={deletingCard === card.id}
                    >
                      {deletingCard === card.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Card Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateFormData({
            name: "",
            rarity: "common",
            element_id: "",
            power: "",
            image_url: "",
          });
        }}
        title="Create New Card"
        showActions={false}
      >
        <form onSubmit={handleCreateSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={createFormData.name}
              onChange={handleCreateInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Rarity:</label>
            <select
              name="rarity"
              value={createFormData.rarity}
              onChange={handleCreateInputChange}
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
              value={createFormData.element_id}
              onChange={handleCreateInputChange}
              required
            >
              <option value="">Select an element</option>
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
              value={createFormData.power}
              onChange={handleCreateInputChange}
              required
              min="1"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Image URL (optional):</label>
            <input
              type="url"
              name="image_url"
              value={createFormData.image_url}
              onChange={handleCreateInputChange}
            />
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => {
                setShowCreateModal(false);
                setCreateFormData({
                  name: "",
                  rarity: "common",
                  element_id: "",
                  power: "",
                  image_url: "",
                });
              }}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Create Card
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Card"
        message={`Are you sure you want to delete ${selectedCard?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ManageCards;
