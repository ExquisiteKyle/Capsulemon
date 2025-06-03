"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/context/AuthContext";
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

        <div className={styles.packsGrid}>
          {packCards.map((card) => (
            <div key={card.card_id} className={styles.pack}>
              <div className={styles.packHeader}>
                <h2 className={styles.packName}>{card.card_name}</h2>
                <div
                  className={`${styles.rarity} ${
                    styles[card.rarity.toLowerCase()]
                  }`}
                >
                  {card.rarity}
                </div>
              </div>
              {card.image_url && (
                <div className={styles.imageWrapper}>
                  <img
                    src={card.image_url}
                    alt={card.card_name}
                    className={styles.cardImage}
                  />
                </div>
              )}
              <div className={styles.cardInfo}>
                {card.element_name} | Power: {card.power}
              </div>
              {editingCard === card.card_id ? (
                <div className={styles.editDropRate}>
                  <input
                    type="number"
                    value={dropRate}
                    onChange={(e) => setDropRate(e.target.value)}
                    step="0.01"
                    min="0"
                    max="100"
                    required
                  />
                  <div className={styles.editActions}>
                    <button
                      className={styles.saveButton}
                      onClick={() =>
                        handleUpdateDropRate(card.card_id, dropRate)
                      }
                    >
                      Save
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={() => {
                        setEditingCard(null);
                        setDropRate("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.dropRate}>
                  Drop Rate: {card.drop_rate}%
                  <div className={styles.packActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => {
                        setEditingCard(card.card_id);
                        setDropRate(card.drop_rate.toString());
                      }}
                    >
                      Edit Rate
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleRemoveCard(card.card_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Card Modal */}
      <Modal
        isOpen={showAddCardModal}
        onClose={() => {
          setShowAddCardModal(false);
          setSelectedCard(null);
          setDropRate("");
        }}
        title="Add Card to Pack"
        showActions={false}
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Card:</label>
            <select
              value={selectedCard?.id || ""}
              onChange={(e) => {
                const card = availableCards.find(
                  (c) => c.id === parseInt(e.target.value)
                );
                setSelectedCard(card);
              }}
              required
            >
              <option value="">Select a card</option>
              {availableCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} ({card.rarity})
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Drop Rate (%):</label>
            <input
              type="number"
              value={dropRate}
              onChange={(e) => setDropRate(e.target.value)}
              step="0.01"
              min="0"
              max="100"
              required
            />
          </div>
          <div className={styles.modalActions}>
            <button
              className={styles.cancelButton}
              onClick={() => {
                setShowAddCardModal(false);
                setSelectedCard(null);
                setDropRate("");
              }}
            >
              Cancel
            </button>
            <button
              className={styles.saveButton}
              onClick={handleAddCard}
              disabled={!selectedCard || !dropRate}
            >
              Add Card
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
