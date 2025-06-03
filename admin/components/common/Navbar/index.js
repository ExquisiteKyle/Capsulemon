"use client";

import { useRouter, usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const currentPath = usePathname();

  const { isLoggedIn, isAdmin, logout } = useAuth();

  const handleManageCards = () => router.push("/admin/manage-cards");
  const handleManagePacks = () => router.push("/admin/manage-packs");

  const handleHome = () => {
    if (!isLoggedIn) {
      router.back();
      return;
    }

    router.push("/");
  };

  const showHomeButton = currentPath !== "/";
  const showLogoutButton = isLoggedIn;
  const showManageCardsButton = isLoggedIn && isAdmin;
  const showManagePacksButton = isLoggedIn && isAdmin;

  if (
    !showHomeButton &&
    !showLogoutButton &&
    !showManageCardsButton &&
    !showManagePacksButton
  ) {
    return <div />;
  }

  return (
    <nav className={styles.navbar}>
      {showHomeButton && (
        <button onClick={handleHome} className={styles.homeButton}>
          Home
        </button>
      )}
      <div className={styles.spacer} />

      {showManagePacksButton && (
        <button onClick={handleManagePacks} className={styles.manageButton}>
          Manage Packs
        </button>
      )}
      {showManageCardsButton && (
        <button onClick={handleManageCards} className={styles.manageButton}>
          Manage Cards
        </button>
      )}
      {showLogoutButton && (
        <button onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      )}
    </nav>
  );
}
