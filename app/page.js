"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [premium, setPremium] = useState(false);

  // ✅ STRIPE UPGRADE FUNCTION (THIS WAS MISSING / WRONG)
  const upgrade = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/checkout`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!data.url) {
        alert("No checkout URL returned");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Payment failed to start");
    }
  };

  // ✅ HANDLE SUCCESS RETURN FROM STRIPE
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
    <main style={{
      padding: 20,
      maxWidth: 500,
      margin: "auto",
      fontFamily: "sans-serif"
    }}>
      <h1>💸 Debt Planner</h1>
      <p>RA Customs</p>

      <div style={{
        marginTop: 20,
        padding: 20,
        borderRadius: 10,
        background: "#f5f5f5"
      }}>
        <h3>Premium Feature</h3>

        <button
          onClick={premium ? () => alert("Feature unlocked!") : upgrade}
          style={{
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: premium ? "#22c55e" : "#0070f3",
            color: "white",
            width: "100%",
            cursor: "pointer",
            fontSize: 16
          }}
        >
          {premium ? "Premium Unlocked ✅" : "Unlock Premium 💳"}
        </button>

        {!premium && (
          <p style={{ marginTop: 10, opacity: 0.6 }}>
            🔒 Payment required to unlock
          </p>
        )}
      </div>
    </main>
  );
}
