"use client";

import { useRouter } from "next/navigation";
import styles from "../../page.module.css";

const Header = ({ username, credits, onLogout, onPurchaseCredits }) => {
  const router = useRouter();

  const handlePurchaseClick = () => {
    if (onPurchaseCredits) {
      onPurchaseCredits();
    } else {
      router.push("/purchase");
    }
  };

  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Welcome, {username}!</h1>
      <div className={styles.headerActions}>
        <span className={styles.credits}>Credits: {credits}</span>
        <button onClick={handlePurchaseClick} className={styles.purchaseButton}>
          Purchase Credits
        </button>
        <button onClick={onLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
