import { useRouter } from "next/router";
import styles from "../styles/Navbar.module.css";
import { useAuth } from "../context/AuthContext"; // Import useAuth

// Remove props as state and logout are now from context
const Navbar = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  // Get authentication state and logout function from AuthContext
  const { isLoggedIn, isAdmin, logout } = useAuth();

  const handleCreateCard = () => router.push("/create-card");
  const handleManageCards = () => router.push("/admin/manage-cards");

  const handleBack = () => {
    // Use early return for the negative case: not logged in
    if (!isLoggedIn) {
      // If not logged in, go back in history
      router.back();
      return; // Early return
    }

    // If logged in (positive case), redirect to the home page (or dashboard)
    // Assuming homepage is now a dashboard or listing page for logged-in users
    router.push("/");
  };

  // Determine if the back button should be visible
  // Hide on the home page, show otherwise
  const showBackButton = currentPath !== "/";

  // Determine if the logout button should be visible
  // Rely directly on the isLoggedIn state from context
  const showLogoutButton = isLoggedIn;

  // Determine if the Create Card button should be visible
  // Rely directly on isLoggedIn and isAdmin states from context
  const showCreateCardButton = isLoggedIn && isAdmin;

  // Determine if the Manage Cards button should be visible
  // Rely directly on isLoggedIn and isAdmin states from context
  const showManageCardsButton = isLoggedIn && isAdmin;

  // Return an empty div if no buttons should be shown (e.g., on login page loading)
  // The AuthContext loading state could also be used here if needed,
  // but for a simple Navbar, just hiding buttons is often sufficient.
  if (
    !showBackButton &&
    !showLogoutButton &&
    !showCreateCardButton &&
    !showManageCardsButton
  ) {
    // Optionally, return null or loading indicator based on AuthContext loading
    // const { loading } = useAuth();
    // if (loading) return null; // or a loading spinner
    return <div />;
  }

  return (
    <nav className={styles.navbar}>
      {showBackButton && (
        <button onClick={handleBack} className={styles.backButton}>
          Back
        </button>
      )}
      {/* Adding a flexible space or title */}
      <div className={styles.spacer} />

      {showManageCardsButton && (
        <button onClick={handleManageCards} className={styles.manageButton}>
          Manage Cards
        </button>
      )}
      {showCreateCardButton && (
        <button onClick={handleCreateCard} className={styles.createButton}>
          Create New Card
        </button>
      )}
      {/* Only show logout if isLoggedIn state from context is true */}
      {showLogoutButton && (
        // Use logout function from context
        <button onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
