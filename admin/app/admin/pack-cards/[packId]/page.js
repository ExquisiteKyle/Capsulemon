"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { useAuth } from "@/context/AuthContext";
import { PackCardsGrid, AddCardModal } from "@/components/pack-cards";
import {
  fetchPackById,
  fetchPackCards,
  fetchAllCards,
  addCardToPack,
  removeCardFromPack,
  updateCardInPack,
} from "@/utils/api";

export default function ManagePackCards({ params }) {
  const router = useRouter();
  const { packId } = params;
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();

  const [pack, setPack] = useState(null);
  const [packCards, setPackCards] = useState([]);
  const [availableCards, setAvailableCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [dropRate, setDropRate] = useState("");
  const [editingCard, setEditingCard] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isLoggedIn || !isAdmin)) {
      router.push("/");
    }
  }, [authLoading, isLoggedIn, isAdmin, router]);

  // Fetch pack and cards data
  useEffect(() => {
    if (!packId || !isLoggedIn || !isAdmin) return;

    const loadData = () => {
      Promise.all([
        fetchPackById(packId).then((res) => res.json()),
        fetchPackCards(packId).then((res) => res.json()),
        fetchAllCards().then((res) => res.json()),
      ])
        .then(([packData, packCardsData, allCardsData]) => {
          setPack(packData);
          setPackCards(packCardsData);
          // Filter out cards that are already in the pack
          const packCardIds = new Set(packCardsData.map((pc) => pc.card_id));
          setAvailableCards(
            allCardsData.filter((card) => !packCardIds.has(card.id))
          );
        })
        .catch((err) => {
          console.error("Error loading data:", err);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    };

    loadData();
  }, [packId, isLoggedIn, isAdmin]);

  const handleAddCard = () => {
    if (!selectedCard || !dropRate) return;

    addCardToPack(packId, selectedCard.id, parseFloat(dropRate))
      .then((response) => {
        if (!response.ok) throw new Error("Failed to add card to pack");
        return response.json();
      })
      .then((data) => {
        // Add the new card to packCards and remove it from availableCards
        setPackCards([...packCards, data.combination]);
        setAvailableCards(
          availableCards.filter((card) => card.id !== selectedCard.id)
        );
        setShowAddCardModal(false);
        setSelectedCard(null);
        setDropRate("");
      })
      .catch((err) => {
        console.error("Error adding card to pack:", err);
        setError(err.message);
      });
  };

  const handleUpdateDropRate = (cardId, newDropRate) => {
    updateCardInPack(packId, cardId, parseFloat(newDropRate))
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update drop rate");
        return response.json();
      })
      .then(() => {
        setPackCards(
          packCards.map((card) =>
            card.card_id === cardId
              ? { ...card, drop_rate: parseFloat(newDropRate) }
              : card
          )
        );
        setEditingCard(null);
      })
      .catch((err) => {
        console.error("Error updating drop rate:", err);
        setError(err.message);
      });
  };

  const handleRemoveCard = (cardId) => {
    removeCardFromPack(packId, cardId)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to remove card from pack");
        // Move the card back to availableCards
        const removedCard = packCards.find((card) => card.card_id === cardId);
        setPackCards(packCards.filter((card) => card.card_id !== cardId));
        setAvailableCards([
          ...availableCards,
          {
            id: removedCard.card_id,
            name: removedCard.card_name,
            rarity: removedCard.rarity,
            element_name: removedCard.element_name,
            power: removedCard.power,
          },
        ]);
      })
      .catch((err) => {
        console.error("Error removing card from pack:", err);
        setError(err.message);
      });
  };

  const handleEditDropRate = (cardId, currentDropRate) => {
    setEditingCard(cardId);
    setDropRate(currentDropRate);
  };

  const handleDropRateChange = (value) => {
    setDropRate(value);
  };

  const handleSaveDropRate = (cardId, newDropRate) => {
    handleUpdateDropRate(cardId, newDropRate);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setDropRate("");
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  const handleDropRateChangeInModal = (value) => {
    setDropRate(value);
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
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => router.push("/admin/manage-packs")}
          >
            ← Back to Packs
          </button>
          <h1 className={styles.title}>Manage Cards in {pack?.name}</h1>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.createButton}
            onClick={() => setShowAddCardModal(true)}
          >
            Add Card to Pack
          </button>
        </div>

        <PackCardsGrid
          packCards={packCards}
          editingCard={editingCard}
          dropRate={dropRate}
          onEditDropRate={handleEditDropRate}
          onRemoveCard={handleRemoveCard}
          onDropRateChange={handleDropRateChange}
          onSaveDropRate={handleSaveDropRate}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <AddCardModal
        isOpen={showAddCardModal}
        onClose={() => {
          setShowAddCardModal(false);
          setSelectedCard(null);
          setDropRate("");
        }}
        onAddCard={handleAddCard}
        selectedCard={selectedCard}
        onCardSelect={handleCardSelect}
        dropRate={dropRate}
        onDropRateChange={handleDropRateChangeInModal}
        availableCards={availableCards}
      />
    </div>
  );
}
