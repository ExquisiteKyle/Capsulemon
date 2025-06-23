"use client";

import { useState } from "react";
import styles from "../../page.module.css";

const TabNavigation = ({ ownedCardsCount, packsCount, onTabChange }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className={styles.tabContainer}>
      <button
        className={`${styles.tabButton} ${
          activeTab === "overview" ? styles.activeTab : ""
        }`}
        onClick={() => handleTabClick("overview")}
      >
        Overview
      </button>
      <button
        className={`${styles.tabButton} ${
          activeTab === "collection" ? styles.activeTab : ""
        }`}
        onClick={() => handleTabClick("collection")}
      >
        Collection ({ownedCardsCount})
      </button>
      <button
        className={`${styles.tabButton} ${
          activeTab === "packs" ? styles.activeTab : ""
        }`}
        onClick={() => handleTabClick("packs")}
      >
        Packs ({packsCount})
      </button>
    </div>
  );
};

export default TabNavigation;
