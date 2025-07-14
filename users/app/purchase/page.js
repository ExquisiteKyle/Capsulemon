"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../shared/auth";
import styles from "./page.module.css";

const PurchasePage = () => {
  const { credits, refreshCredits, api } = useAuth();
  const router = useRouter();

  const [selectedAmount, setSelectedAmount] = useState(100);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const creditPackages = [
    { amount: 100, price: 5, bonus: 0 },
    { amount: 250, price: 10, bonus: 25 },
    { amount: 500, price: 18, bonus: 75 },
    { amount: 1000, price: 30, bonus: 200 },
  ];

  const handlePurchase = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    const response = await api.purchaseCredits(selectedAmount, paymentMethod);
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Purchase failed");
      setIsProcessing(false);
      return;
    }

    setSuccess(data.message);
    await refreshCredits();

    // Redirect to home page after 2 seconds
    setTimeout(() => {
      router.push("/");
    }, 2000);

    setIsProcessing(false);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Purchase Credits</h1>
        <p className={styles.currentCredits}>Current Credits: {credits}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.packagesSection}>
          <h2>Select Credit Package</h2>
          <div className={styles.packagesGrid}>
            {creditPackages.map((pkg) => (
              <div
                key={pkg.amount}
                className={`${styles.packageCard} ${
                  selectedAmount === pkg.amount ? styles.selected : ""
                }`}
                onClick={() => setSelectedAmount(pkg.amount)}
              >
                <div className={styles.packageAmount}>{pkg.amount} Credits</div>
                <div className={styles.packagePrice}>${pkg.price}</div>
                {pkg.bonus > 0 && (
                  <div className={styles.packageBonus}>+{pkg.bonus} Bonus!</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.paymentSection}>
          <h2>Payment Information</h2>
          <form onSubmit={handlePurchase} className={styles.paymentForm}>
            <div className={styles.formGroup}>
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  type="text"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="cvv">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  placeholder="123"
                  maxLength="4"
                  required
                />
              </div>
            </div>

            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Selected Credits:</span>
                <span>{selectedAmount}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Total Price:</span>
                <span>
                  $
                  {
                    creditPackages.find((p) => p.amount === selectedAmount)
                      ?.price
                  }
                </span>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <button
              type="submit"
              className={styles.purchaseButton}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Purchase Credits"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
