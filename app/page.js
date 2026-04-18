"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);

  // 💳 STRIPE CHECKOUT
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

  // ✅ HANDLE SUCCESS RETURN
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("success")) {
      setPremium(true);
      localStorage.setItem("premium", "true");
      alert("🎉 Payment successful! Premium unlocked");
    }

    const saved = localStorage.getItem("premium");
    if (saved === "true") setPremium(true);
  }, []);

  return (
    <main
      style={{
        padding: "40px 20px",
        maxWidth: 800,
        margin: "auto",
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <h1 style={{ fontSize: 32, fontWeight: "700" }}>
        💸 Debt Planner
      </h1>
      <p style={{ opacity: 0.6 }}>by RA Customs</p>

      {/* CARD */}
      <div
        style={{
          marginTop: 30,
          padding: 30,
          borderRadius: 16,
          background: "linear-gradient(145deg, #f8fafc, #e2e8f0)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ fontSize: 20, marginBottom: 15 }}>
          Premium Feature
        </h3>

        <button
          onClick={premium ? () => alert("Feature unlocked!") : upgrade}
          disabled={loading}
          style={{
            padding: 16,
            borderRadius: 12,
            border: "none",
            background: premium
              ? "linear-gradient(90deg,#22c55e,#16a34a)"
              : "linear-gradient(90deg,#2563eb,#1d4ed8)",
            color: "white",
            width: "100%",
            cursor: "pointer",
            fontSize: 18,
            fontWeight: "600",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {premium
            ? "Premium Unlocked ✅"
            : loading
            ? "Loading..."
            : "Unlock Premium 💳"}
        </button>

        {!premium && (
          <p style={{ marginTop: 12, opacity: 0.6 }}>
            🔒 Payment required to unlock
          </p>
        )}
      </div>
    </main>
  );
}
