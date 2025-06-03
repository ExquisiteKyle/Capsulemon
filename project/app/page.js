import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Project Website</h1>
      <p className={styles.description}>
        This is the user-facing website for the project.
      </p>
    </div>
  );
}
