"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { useAuth } from "@/context/AuthContext";
import { fetchCards } from "@/utils/api";
import {
  CardsHeader,
  CardsControls,
  OverviewCardGrid,
} from "@/components/cards-overview";

const AdminCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const router = useRouter();
  const { isLoggedIn, loading: authLoading, username } = useAuth();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await fetchCards();
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch cards`);
        }
        const data = await response.json();
        setCards(data);
      } catch (err) {
        console.error("Failed to fetch cards:", err);
        setError(err.message);
        if (err.message.includes("401")) {
          router.push("/");
        }
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchCardData();
    }
  }, [isLoggedIn, router]);

  const filteredCards = cards.filter((card) => {
    const matchesSearch = card.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRarity =
      selectedRarity === "all" || card.rarity === selectedRarity;
    return matchesSearch && matchesRarity;
  });

  const rarityOptions = ["all", ...new Set(cards.map((card) => card.rarity))];

  if (loading || authLoading) {
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
      <CardsHeader
        username={username}
        totalCards={cards.length}
        uniqueRarities={rarityOptions.length - 1}
      />
      <CardsControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRarity={selectedRarity}
        onRarityChange={setSelectedRarity}
        rarityOptions={rarityOptions}
        onAddNew={() => router.push("/admin/manage-cards")}
      />
      <OverviewCardGrid cards={filteredCards} />
    </div>
  );
};

export default AdminCards;
