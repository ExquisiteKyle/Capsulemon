import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/CreateCard.module.css";
import Navbar from "../components/Navbar";
import Background from "../components/Background";
import { useAuth } from "../context/AuthContext";
import { fetchElements, createCard } from "../utils/api";

const CreateCard = () => {
  const router = useRouter();
  const [elements, setElements] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    rarity: "common",
    element_id: "",
    power: "",
    image_url: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) router.push("/");
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    const fetchElementsData = async () => {
      if (!isLoggedIn) return;
      setPageLoading(true);
      fetchElements()
        .then(async (elementsResponse) => {
          if (!elementsResponse.ok) {
            console.error(
              "Failed to fetch elements with status:",
              elementsResponse.status
            );
            setError("Failed to load elements");
            return;
          }
          const elementsData = await elementsResponse.json();
          setElements(elementsData);
        })
        .catch((err) => {
          console.error("Error fetching elements:", err);
          setError("An error occurred while loading elements");
        })
        .finally(() => {
          setPageLoading(false);
        });
    };

    if (!isLoggedIn) return;
    fetchElementsData();
  }, [isLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isLoggedIn) {
      setError("Not authenticated. Please log in.");
      router.push("/");
      return;
    }

    createCard(formData)
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          if (response.status === 401) {
            router.push("/");
          } else if (response.status === 403) {
            setError("Forbidden: Only administrators can create cards.");
          } else {
            setError(data.message || "Failed to create card");
          }
          return;
        }
        setSuccess("Card created successfully!");
        setFormData({
          name: "",
          rarity: "common",
          element_id: "",
          power: "",
          image_url: "",
        });
      })
      .catch((err) => {
        console.error("An error occurred while creating the card:", err);
        setError("An error occurred while creating the card");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (authLoading || pageLoading) return <Background />;

  if (!isLoggedIn) return <div />;

  return (
    <div className={styles.container}>
      <Background />
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
      <h1 className={styles.title}>Create New Card</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Card Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="rarity">Rarity:</label>
          <select
            id="rarity"
            name="rarity"
            value={formData.rarity}
            onChange={handleChange}
            required
          >
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="element_id">Element:</label>
          <select
            id="element_id"
            name="element_id"
            value={formData.element_id}
            onChange={handleChange}
            required
          >
            <option value="">Select an element</option>
            {elements.map((element) => (
              <option key={element.id} value={element.id}>
                {element.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="power">Power:</label>
          <input
            type="number"
            id="power"
            name="power"
            value={formData.power}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image_url">Image URL (optional):</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <button type="submit" className={styles.submitButton}>
          Create Card
        </button>
      </form>
    </div>
  );
};

export default CreateCard;
