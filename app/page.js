"use client";
import { useState, useEffect } from "react";

/* 🎉 CONFETTI */
const confetti = () => {
  for (let i = 0; i < 50; i++) {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.width = "6px";
    el.style.height = "6px";
    el.style.background = `hsl(${Math.random() * 360},100%,50%)`;
    el.style.top = "-10px";
    el.style.left = Math.random() * window.innerWidth + "px";
    el.style.zIndex = 9999;
    document.body.appendChild(el);

    el.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(100vh)" }],
      { duration: 1000 }
    ).onfinish = () => el.remove();
  }
};

export default function Page() {
  /* STATE */
  const [premium, setPremium] = useState(false);
  const [debts, setDebts] = useState([]);
  const [paymentInputs, setPaymentInputs] = useState({});
  const [freeUses, setFreeUses] = useState(0);

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState([]);

  const FREE_LIMIT = 60;

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("");
  const [min, setMin] = useState("");

  const trialActive = freeUses < FREE_LIMIT;

  /* LOAD */
  useEffect(() => {
    const used = localStorage.getItem("freeUses");
    if (used) setFreeUses(parseInt(used));

    if (localStorage.getItem("premium") === "true") {
      setPremium(true);
    }
  }, []);

  /* XP SYSTEM */
  const addXP = (amount) => {
    let newXP = xp + amount;
    let newLevel = level;

    if (newXP >= level * 100) {
      newXP -= level * 100;
      newLevel++;
      confetti();
      unlockBadge("Level Up 🚀");
    }

    setXp(newXP);
    setLevel(newLevel);
  };

  /* BADGES */
  const unlockBadge = (name) => {
    if (!badges.includes(name)) {
      setBadges((b) => [...b, name]);
    }
  };

  /* ADD DEBT */
  const addDebt = () => {
    if (!name || !balance) return;

    setDebts([
      ...debts,
      {
        name,
        balance: parseFloat(balance),
        rate: parseFloat(rate),
        min: parseFloat(min),
      },
    ]);

    unlockBadge("First Debt Added 💳");

    setName("");
    setBalance("");
    setRate("");
    setMin("");
  };

  /* APPLY PAYMENT */
  const applyPayment = (i) => {
    if (!premium && !trialActive) {
      alert("🔒 Trial ended. Upgrade to continue.");
      return;
    }

    const amount = parseFloat(paymentInputs[i]);
    if (!amount) return;

    let updated = [...debts];

    updated[i].balance = Math.max(0, updated[i].balance - amount);

    if (updated[i].balance === 0) {
      confetti();
      unlockBadge("Debt Destroyer 💥");
    }

    setDebts(updated);

    addXP(20);

    if (!premium) {
      const count = freeUses + 1;
      setFreeUses(count);
      localStorage.setItem("freeUses", count);
    }
  };

  return (
    <main style={styles.main}>
      <h1>💸 Debt Planner</h1>

      {/* TRIAL */}
      {!premium && (
        <p>
          Trial: {freeUses}/{FREE_LIMIT}
        </p>
      )}

      {/* LEVEL */}
      <div style={styles.card}>
        <h3>🎮 Level {level}</h3>
        <div style={styles.bar}>
          <div
            style={{
              ...styles.fill,
              width: `${(xp / (level * 100)) * 100}%`,
            }}
          />
        </div>
        <p>{xp} XP</p>
      </div>

      {/* ADD */}
      <div style={styles.card}>
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input placeholder="Balance" onChange={(e) => setBalance(e.target.value)} />
        <button onClick={addDebt}>Add</button>
      </div>

      {/* LIST */}
      <div style={styles.card}>
        {debts.map((d, i) => (
          <div key={i} style={styles.row}>
            <div>
              <strong>{d.name}</strong>
              <p>${d.balance.toFixed(2)}</p>
            </div>

            <div>
              <input
                placeholder="Pay"
                onChange={(e) =>
                  setPaymentInputs({
                    ...paymentInputs,
                    [i]: e.target.value,
                  })
                }
                style={styles.input}
              />
              <button onClick={() => applyPayment(i)}>Pay</button>
            </div>
          </div>
        ))}
      </div>

      {/* BADGES */}
      <div style={styles.card}>
        <h3>🏆 Badges</h3>
        <div style={styles.badgeGrid}>
          {badges.map((b, i) => (
            <div key={i} style={styles.badge}>
              {b}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* STYLES */
const styles = {
  main: { padding: 20, maxWidth: 600, margin: "auto" },
  card: { background: "#f1f5f9", padding: 15, marginBottom: 15 },
  row: { display: "flex", justifyContent: "space-between" },
  input: { width: 70 },
  bar: { height: 8, background: "#ddd", borderRadius: 10 },
  fill: { height: "100%", background: "#22c55e" },
  badgeGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  badge: {
    background: "#22c55e",
    color: "white",
    padding: "5px 10px",
    borderRadius: 6,
  },
};
