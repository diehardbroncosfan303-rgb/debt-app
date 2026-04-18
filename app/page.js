"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);

  const upgrade = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${window.location.origin}/api/checkout`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!data.url) {
        alert("ERROR: " + data.error);
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Payment failed to start");
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("success")) {
      setPremium(true);
      localStorage.setItem("premium", "true");
      alert("🎉 Premium unlocked!");
    }

    const saved = localStorage.getItem("premium");
    if (saved === "true") setPremium(true);
  }, []);

  return (
    <main style={styles.main}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>💸 Debt Planner</h1>
        <p style={styles.subtitle}>by RA Customs</p>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Upgrade to Premium</h2>

        <ul style={styles.features}>
          <li>📊 Advanced payoff tracking</li>
          <li>📈 Visual progress charts</li>
          <li>💡 Smart payoff strategies</li>
          <li>🏆 Gamified milestones</li>
        </ul>

        <button
          onClick={premium ? () => alert("Already unlocked!") : upgrade}
          disabled={loading}
          style={{
            ...styles.button,
            background: premium
              ? "linear-gradient(90deg,#22c55e,#16a34a)"
              : "linear-gradient(90deg,#2563eb,#1d4ed8)",
            transform: loading ? "scale(0.98)" : "scale(1)",
          }}
        >
          {premium
            ? "Premium Unlocked ✅"
            : loading
            ? "Processing..."
            : "Unlock Premium 💳"}
        </button>

        {!premium && (
          <p style={styles.locked}>
            🔒 One-time payment to unlock all features
          </p>
        )}
      </div>
    </main>
  );
}

/* 🎨 STYLES */
const styles = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    color: "white",
    fontFamily: "system-ui, sans-serif",
  },

  header: {
    textAlign: "center",
    marginBottom: 40,
  },

  title: {
    fontSize: 36,
    fontWeight: 700,
  },

  subtitle: {
    opacity: 0.6,
    marginTop: 5,
  },

  card: {
    width: "100%",
    maxWidth: 500,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(15px)",
    borderRadius: 20,
    padding: 30,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  cardTitle: {
    fontSize: 22,
    marginBottom: 20,
  },

  features: {
    listStyle: "none",
    padding: 0,
    marginBottom: 25,
    lineHeight: "28px",
    opacity: 0.85,
  },

  button: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    border: "none",
    color: "white",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  locked: {
    marginTop: 12,
    fontSize: 13,
    opacity: 0.6,
    textAlign: "center",
  },
};
