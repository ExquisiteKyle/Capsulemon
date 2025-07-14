"use client";

import { useState, useEffect } from "react";
import styles from "./InteractivePackReveal.module.css";

export default function InteractivePackReveal({
  isOpen,
  onClose,
  packName,
  drawnCards,
  onRevealComplete,
}) {
  const [revealedCards, setRevealedCards] = useState([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showCompleteButton, setShowCompleteButton] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRevealedCards([]);
      setIsRevealing(false);
      setShowCompleteButton(false);
    }
  }, [isOpen]);

  // Create a more robust key generation function
  const generateKey = (card, index) => {
    // Always include index to ensure uniqueness, even with duplicate cards
    if (card.card_id) return `reveal-${card.card_id}-${index}`;
    if (card.id) return `reveal-${card.id}-${index}`;
    if (card.card_name) return `reveal-${card.card_name}-${index}`;
    // Fallback to index with a unique prefix
    return `reveal-${index}`;
  };

  const handleCardTap = (index) => {
    if (isRevealing || revealedCards.includes(index)) return;

    setIsRevealing(true);

    // Add the tapped card to revealed cards
    const newRevealedCards = [...revealedCards, index];
    setRevealedCards(newRevealedCards);

    // Check if all cards are revealed after animation
    setTimeout(() => {
      setIsRevealing(false);

      if (newRevealedCards.length >= drawnCards.length) {
        setShowCompleteButton(true);
      }
    }, 800);
  };

  const handleComplete = () => {
    if (onRevealComplete) {
      onRevealComplete();
    }
    onClose();
  };

  const handleSkip = () => {
    // Reveal all cards at once
    const allCardIndices = drawnCards.map((_, index) => index);
    setRevealedCards(allCardIndices);
    setShowCompleteButton(true);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Opening {packName}</h2>
          <button className={styles.skipButton} onClick={handleSkip}>
            Reveal All
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.cardsContainer}>
            {drawnCards.map((card, index) => {
              const isRevealed = revealedCards.includes(index);
              const isRevealable = !isRevealed && !isRevealing;

              return (
                <div
                  key={generateKey(card, index)}
                  className={`${styles.cardSlot} ${
                    isRevealed ? styles.revealed : ""
                  } ${isRevealable ? styles.revealable : ""}`}
                  onClick={
                    isRevealable ? () => handleCardTap(index) : undefined
                  }
                >
                  {isRevealed ? (
                    <div className={styles.revealedCard}>
                      <div className={styles.cardImageContainer}>
                        {card.image_url ? (
                          <img
                            src={card.image_url}
                            alt={card.card_name}
                            className={styles.cardImage}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                        ) : null}
                        <div className={styles.cardImagePlaceholder}>
                          <span className={styles.cardName}>
                            {card.card_name}
                          </span>
                        </div>
                      </div>
                      <div className={styles.cardDetails}>
                        <span className={styles.cardName}>
                          {card.card_name}
                        </span>
                        <span
                          className={`${styles.cardRarity} ${
                            styles[card.rarity.toLowerCase()]
                          }`}
                        >
                          {card.rarity}
                        </span>
                        <span className={styles.cardElement}>
                          {card.element_name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.maskedCard}>
                      <div className={styles.cardBack}>
                        <div className={styles.cardBackPattern}>
                          <div className={styles.patternLine}></div>
                          <div className={styles.patternLine}></div>
                          <div className={styles.patternLine}></div>
                        </div>
                        <div className={styles.cardBackText}>?</div>
                      </div>
                      {!isRevealed && (
                        <div className={styles.tapIndicator}>
                          <span>Tap to reveal!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.progress}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${(revealedCards.length / drawnCards.length) * 100}%`,
                }}
              ></div>
            </div>
            <span className={styles.progressText}>
              {revealedCards.length} / {drawnCards.length} cards revealed
            </span>
          </div>

          <div
            className={`${styles.footer} ${
              showCompleteButton ? styles.visible : ""
            }`}
          >
            <button className={styles.completeButton} onClick={handleComplete}>
              Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
