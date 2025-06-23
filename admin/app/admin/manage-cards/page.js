"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { useAuth } from "@/context/AuthContext";
import {
  CardsGrid,
  CreateCardModal,
  DeleteCardModal,
} from "@/components/cards";
import {
  fetchAllCards,
  fetchElements,
  updateCard,
  deleteCard,
  createCard,
} from "@/utils/api";

export default function ManageCards() {
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
    if (!editFormData || !editingCard) return;

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
                )?.name,
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
      )?.name;
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
    return <div className={styles.container}>Unauthorized</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${isLoggedIn ? styles.withNavbar : ""}`}
    >
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

        <CardsGrid
          cards={cards}
          elements={elements}
          editingCard={editingCard}
          editFormData={editFormData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSave={handleEditSubmit}
          onCancel={handleCancelEdit}
          onInputChange={handleInputChange}
          deletingCard={deletingCard}
        />
      </div>

      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        formData={createFormData}
        onInputChange={handleCreateInputChange}
        elements={elements}
        error={error}
      />

      <DeleteCardModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCard(null);
        }}
        onConfirm={handleConfirmDelete}
        cardName={selectedCard?.name}
        isDeleting={!!deletingCard}
      />
    </div>
  );
}
