"use client";

import { useRouter } from "next/navigation";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard({ username }) {
  const router = useRouter();

  return (
    <div className={styles.adminPageWrapper}>
      <div className={styles.adminDashboard}>
        <div className={styles.dashboardHeader}>
          <div className={styles.welcomeSection}>
            <h1>Admin Dashboard</h1>
            <p className={styles.welcomeMessage}>Welcome back, {username}!</p>
          </div>
          <div className={styles.adminInfo}>
            <span className={styles.statusBadge}>Administrator</span>
            <p className={styles.lastLogin}>
              Last login: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className={styles.quickStats}>
          <div className={styles.statCard}>
            <h3>Quick Actions</h3>
            <div className={styles.actionButtons}>
              <button
                onClick={() => router.push("/admin/manage-cards")}
                className={styles.actionButton}
              >
                Manage Cards
              </button>
              <button
                onClick={() => router.push("/admin/manage-packs")}
                className={styles.actionButton}
              >
                Manage Packs
              </button>
              <button
                onClick={() => router.push("/admin/pack-cards")}
                className={styles.actionButton}
              >
                Pack Cards
              </button>
            </div>
          </div>
        </div>

        <div className={styles.adminSections}>
          <div className={styles.section}>
            <h2>Card Management</h2>
            <p>
              Create, edit, and manage your card collection. Control card
              attributes, rarities, and more.
            </p>
            <button
              onClick={() => router.push("/admin/manage-cards")}
              className={styles.sectionButton}
            >
              Go to Card Management
            </button>
          </div>

          <div className={styles.section}>
            <h2>Pack Management</h2>
            <p>
              Configure and manage card packs. Set pack contents, prices, and
              availability.
            </p>
            <button
              onClick={() => router.push("/admin/manage-packs")}
              className={styles.sectionButton}
            >
              Go to Pack Management
            </button>
          </div>

          <div className={styles.section}>
            <h2>Pack Cards</h2>
            <p>
              Organize cards into packs. Create new pack combinations and manage
              existing ones.
            </p>
            <button
              onClick={() => router.push("/admin/pack-cards")}
              className={styles.sectionButton}
            >
              Go to Pack Cards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
