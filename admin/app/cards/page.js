"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { useAuth } from "@/context/AuthContext";
import { fetchCards } from "@/utils/api";

export default function AdminCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const router = useRouter();
  const { isLoggedIn, loading: authLoading, username } = useAuth();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push("/");
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const data = await fetchCards()
          .then((response) => response.json())
          .then((response) => response);
        setCards(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch cards:", err);
        setError(err.message);
        setLoading(false);
        if (err.message.includes("401")) {
          router.push("/");
        }
      }
    };

    fetchCardData();
  }, [router]);

  const filteredCards = cards.filter((card) => {
    const matchesSearch = card.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRarity =
      selectedRarity === "all" || card.rarity === selectedRarity;
    return matchesSearch && matchesRarity;
  });

  const rarityOptions = ["all", ...new Set(cards.map((card) => card.rarity))];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading administrative panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Card Administration Panel</h1>
          <p className={styles.adminInfo}>Logged in as: {username}</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Total Cards</span>
            <span className={styles.statValue}>{cards.length}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Unique Rarities</span>
            <span className={styles.statValue}>{rarityOptions.length - 1}</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterBox}>
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className={styles.filterSelect}
          >
            {rarityOptions.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => router.push("/admin/manage-cards")}
          className={styles.addButton}
        >
          Add New Card
        </button>
      </div>

      <div className={styles.cardGrid}>
        {filteredCards.length > 0 ? (
          filteredCards.map((card) => (
            <div key={card.id} className={styles.cardItem}>
              <div className={styles.cardHeader}>
                <h2>{card.name}</h2>
                <div className={styles.cardActions}>
                  <button className={styles.editButton}>Edit</button>
                  <button className={styles.deleteButton}>Delete</button>
                </div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardInfo}>
                  <p>
                    <strong>Rarity:</strong> {card.rarity}
                  </p>
                  <p>
                    <strong>Power:</strong> {card.power}
                  </p>
                  <p>
                    <strong>Element:</strong> {card.element_name}
                  </p>
                </div>
                {card.image_url && (
                  <div className={styles.imageContainer}>
                    <img
                      src={card.image_url}
                      alt={card.name}
                      className={styles.cardImage}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No cards found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
