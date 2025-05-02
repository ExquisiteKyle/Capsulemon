import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Cards.module.css"; // We will create this CSS module
import Navbar from "../components/Navbar"; // Import the Navbar component
import { useAuth } from "../context/AuthContext";
import { fetchCards } from "../utils/api"; // Import fetchCards from api.js

const Cards = () => {
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
      // Renamed to avoid conflict
      try {
        // Use the fetchCards function from api.js
        const data = await fetchCards()
          .then((response) => response.json())
          .then((response) => response);
        setCards(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch cards:", err);
        setError(err.message);
        setLoading(false);
        // Handle 401 specifically if needed here, although fetchWithAuth should handle network errors
        if (err.message.includes("401")) {
          // Basic check for 401 in error message
          router.push("/");
        }
      }
    };

    fetchCardData(); // Call the renamed function
  }, [router]); // Dependency array includes router

  if (loading) {
    return <div className={styles.container}>Loading cards...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <Navbar /> {/* Add the Navbar component here */}
      <h1>Card Collection</h1>
      <div className={styles.grid}>
        {cards.length &&
          cards.map((card) => (
            <div key={card.id} className={styles.card}>
              <h2>{card.name}</h2>
              <p>Rarity: {card.rarity}</p>
              <p>Power: {card.power}</p>
              {/* Display the element name */}
              <p>Element: {card.element_name}</p>
              {card.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
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
};

export default Cards;
