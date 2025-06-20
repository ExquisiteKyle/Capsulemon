"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../shared/auth";
import { PackResultModal, ConfirmModal } from "../../shared/components";
import Card from "./components/Card";
import Pack from "./components/Pack";
import Stats from "./components/Stats";
import styles from "./page.module.css";

export default function Home() {
  const { isLoggedIn, loading, username, logout, credits, setCredits, api } =
    useAuth();
  const router = useRouter();

  const [ownedCards, setOwnedCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [packs, setPacks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packResult, setPackResult] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [packToOpen, setPackToOpen] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

  useEffect(() => {
    if (isLoggedIn && !loading) {
      fetchUserData();
    }
  }, [isLoggedIn, loading]);

  const fetchUserData = async () => {
    setDataLoading(true);
    setError(null);

    const [ownedCardsRes, allCardsRes, packsRes, creditsRes] =
      await Promise.all([
        api.getOwnedCards(),
        api.getAllCards(),
        api.getAllPacks(),
        api.getUserCredits(),
      ]);

    if (!ownedCardsRes.ok) {
      setError("Failed to fetch owned cards");
      setDataLoading(false);
      return;
    }

    if (!allCardsRes.ok) {
      setError("Failed to fetch all cards");
      setDataLoading(false);
      return;
    }

    if (!packsRes.ok) {
      setError("Failed to fetch packs");
      setDataLoading(false);
      return;
    }

    if (!creditsRes.ok) {
      setError("Failed to fetch user credits");
      setDataLoading(false);
      return;
    }

    const [ownedCardsData, allCardsData, packsData, creditsData] =
      await Promise.all([
        ownedCardsRes.json(),
        allCardsRes.json(),
        packsRes.json(),
        creditsRes.json(),
      ]);

    setOwnedCards(ownedCardsData);
    setAllCards(allCardsData);
    setPacks(packsData);
    setCredits(creditsData.credits);
    setDataLoading(false);
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push("/login");
    }
  };

  const handlePackOpen = (pack) => {
    if (credits < pack.cost) {
      setErrorMessage(
        `Insufficient credits! You need ${pack.cost} credits to open this pack.`
      );
      setIsErrorModalOpen(true);
      return;
    }

    // Show confirmation modal
    setPackToOpen(pack);
    setIsConfirmModalOpen(true);
  };

  const confirmPackOpen = async () => {
    if (!packToOpen) return;

    try {
      const response = await api.openPack(packToOpen.id);

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "Insufficient credits") {
          setErrorMessage(
            `Insufficient credits! You need ${errorData.required} credits but only have ${errorData.current}.`
          );
        } else {
          setErrorMessage(`Failed to open pack: ${errorData.error}`);
        }
        setIsErrorModalOpen(true);
        return;
      }

      const result = await response.json();

      // Update local state
      setCredits(result.remainingCredits);

      // Refresh user data to get updated collection
      await fetchUserData();

      // Set modal data and open modal
      setPackResult({
        packName: packToOpen.name,
        drawnCards: result.drawnCards,
        creditsSpent: result.creditsSpent,
        remainingCredits: result.remainingCredits,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error opening pack:", error);
      setErrorMessage("Failed to open pack. Please try again.");
      setIsErrorModalOpen(true);
    } finally {
      setIsConfirmModalOpen(false);
      setPackToOpen(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  if (dataLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome, {username}!</h1>
          <div className={styles.headerActions}>
            <span className={styles.credits}>Credits: {credits}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
        <div className={styles.loadingContainer}>
          <p>Loading your collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {username}!</h1>
        <div className={styles.headerActions}>
          <span className={styles.credits}>Credits: {credits}</span>
          <button
            onClick={() => router.push("/purchase")}
            className={styles.purchaseButton}
          >
            Purchase Credits
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
          <button onClick={fetchUserData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "overview" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "collection" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("collection")}
        >
          Collection ({ownedCards.length})
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "packs" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("packs")}
        >
          Packs ({packs.length})
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "overview" && (
          <div className={styles.overviewContainer}>
            <Stats ownedCards={ownedCards} totalCards={allCards.length} />

            <div className={styles.recentCards}>
              <h2>Recent Cards</h2>
              {ownedCards.length > 0 ? (
                <div className={styles.cardsGrid}>
                  {ownedCards.slice(0, 6).map((card) => (
                    <Card key={card.id} card={card} quantity={card.quantity} />
                  ))}
                </div>
              ) : (
                <p className={styles.emptyMessage}>
                  You don't have any cards yet. Open some packs to get started!
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "collection" && (
          <div className={styles.collectionContainer}>
            <h2>Your Card Collection</h2>
            {ownedCards.length > 0 ? (
              <div className={styles.cardsGrid}>
                {ownedCards.map((card) => (
                  <Card key={card.id} card={card} quantity={card.quantity} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyContainer}>
                <p className={styles.emptyMessage}>
                  Your collection is empty. Open some packs to get cards!
                </p>
                <button
                  className={styles.openPacksButton}
                  onClick={() => setActiveTab("packs")}
                >
                  Browse Packs
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "packs" && (
          <div className={styles.packsContainer}>
            <h2>Available Packs</h2>
            {packs.length > 0 ? (
              <div className={styles.packsGrid}>
                {packs.map((pack) => (
                  <Pack
                    key={pack.id}
                    pack={pack}
                    onOpen={handlePackOpen}
                    userCredits={credits}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>
                No packs are currently available.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pack Result Modal */}
      {isModalOpen && packResult && (
        <PackResultModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          packName={packResult.packName}
          drawnCards={packResult.drawnCards}
          creditsSpent={packResult.creditsSpent}
          remainingCredits={packResult.remainingCredits}
        />
      )}

      {/* Confirm Pack Opening Modal */}
      {isConfirmModalOpen && packToOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setPackToOpen(null);
          }}
          onConfirm={confirmPackOpen}
          title="Confirm Pack Opening"
          message={`Are you sure you want to open "${packToOpen.name}" for ${packToOpen.cost} credits?`}
          confirmText="Open Pack"
          cancelText="Cancel"
        />
      )}

      {/* Error Modal */}
      {isErrorModalOpen && errorMessage && (
        <ConfirmModal
          isOpen={isErrorModalOpen}
          onClose={() => {
            setIsErrorModalOpen(false);
            setErrorMessage(null);
          }}
          onConfirm={() => {
            setIsErrorModalOpen(false);
            setErrorMessage(null);
          }}
          title="Error"
          message={errorMessage}
          confirmText="OK"
          showCancel={false}
        />
      )}
    </div>
  );
}
