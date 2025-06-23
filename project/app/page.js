"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../shared/auth";
import { InteractivePackReveal, ConfirmModal } from "../../shared/components";
import {
  VideoBackground,
  Header,
  TabNavigation,
  ErrorDisplay,
} from "./components/layout";
import {
  OverviewSection,
  CollectionSection,
  PacksSection,
  LoadingSection,
} from "./components/sections";
import styles from "./page.module.css";
import useUserData from "./hooks/useUserData";

const Home = () => {
  const { isLoggedIn, loading, username, logout, credits, setCredits, api } =
    useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Data state
  const [ownedCards, setOwnedCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [packs, setPacks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const onSwitchToPacks = () => {
    setActiveTab("packs");
  };

  if (loading) {
    return <LoadingSection />;
  }

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  const renderActiveSection = () => {
    if (dataLoading) {
      return <LoadingSection message="Loading your collection..." />;
    }

    switch (activeTab) {
      case "overview":
        return (
          <OverviewSection
            ownedCards={ownedCards}
            totalCards={allCards.length}
          />
        );
      case "collection":
        return (
          <CollectionSection
            ownedCards={ownedCards}
            onSwitchToPacks={onSwitchToPacks}
          />
        );
      case "packs":
        return (
          <PacksSection
            packs={packs}
            onPackOpen={handlePackOpen}
            userCredits={credits}
          />
        );
      default:
        return <LoadingSection message="Loading..." />;
    }
  };

  return (
    <>
      <VideoBackground />

      <div className={styles.container}>
        <Header
          username={username}
          credits={credits}
          onLogout={handleLogout}
          onPurchase={() => router.push("/purchase")}
        />

        {error && <ErrorDisplay error={error} onRetry={fetchUserData} />}

        <TabNavigation
          ownedCardsCount={ownedCards.length}
          packsCount={packs.length}
          onTabChange={handleTabChange}
        />

        <div className={styles.content}>{renderActiveSection()}</div>

        {/* Interactive Pack Reveal Modal */}
        {isModalOpen && packResult && (
          <InteractivePackReveal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            packName={packResult.packName}
            drawnCards={packResult.drawnCards}
            onRevealComplete={() => {
              // Optional: Add any additional logic when reveal is complete
              console.log("Pack reveal completed!");
            }}
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
    </>
  );
};

export default Home;
