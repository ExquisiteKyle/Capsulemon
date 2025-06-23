"use client";

import { useState, useEffect } from "react";

const useUserData = (api, setCredits, shouldFetch = false) => {
  const [ownedCards, setOwnedCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [packs, setPacks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    setDataLoading(true);
    setError(null);

    try {
      const [ownedCardsRes, allCardsRes, packsRes, creditsRes] =
        await Promise.all([
          api.getOwnedCards(),
          api.getAllCards(),
          api.getAllPacks(),
          api.getUserCredits(),
        ]);

      if (!ownedCardsRes.ok) {
        throw new Error("Failed to fetch owned cards");
      }

      if (!allCardsRes.ok) {
        throw new Error("Failed to fetch all cards");
      }

      if (!packsRes.ok) {
        throw new Error("Failed to fetch packs");
      }

      if (!creditsRes.ok) {
        throw new Error("Failed to fetch user credits");
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
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFetch && api) {
      fetchUserData();
    }
  }, [shouldFetch, api]);

  const refreshData = () => {
    fetchUserData();
  };

  return {
    ownedCards,
    allCards,
    packs,
    dataLoading,
    error,
    fetchUserData,
    refreshData,
  };
};

export default useUserData;
