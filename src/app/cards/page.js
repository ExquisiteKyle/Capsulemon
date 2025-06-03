"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { useAuth } from "@/context/AuthContext";
import { fetchCards } from "@/utils/api";

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();

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

  if (loading) {
    return <div className={styles.container}>Loading cards...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Card Collection</h1>
      <div className={styles.grid}>
        {cards.length > 0 &&
          cards.map((card) => (
            <div key={card.id} className={styles.card}>
              <h2>{card.name}</h2>
              <p>Rarity: {card.rarity}</p>
              <p>Power: {card.power}</p>
              <p>Element: {card.element_name}</p>
              {card.image_url && (
                <img
                  src={card.image_url}
                  alt={card.name}
                  className={styles.cardImage}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
