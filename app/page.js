"use client";
import { useState, useEffect } from "react";

/* 🎉 CONFETTI */
const confetti = () => {
  for (let i = 0; i < 30; i++) {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.width = "6px";
    el.style.height = "6px";
    el.style.background = `hsl(${Math.random() * 360},100%,50%)`;
    el.style.top = "-10px";
    el.style.left = Math.random() * window.innerWidth + "px";
    document.body.appendChild(el);

    el.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(100vh)" }],
      { duration: 800 }
    ).onfinish = () => el.remove();
  }
};

/* 💸 ANIMATE NUMBER */
const animateValue = (start, end, duration, callback) => {
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percent = Math.min(progress / duration, 1);
    const value = start + (end - start) * percent;
    callback(value);
    if (percent < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};

export default function Page() {
  /* STATE */
  const [tab, setTab] = useState("dashboard");

  const [debts, setDebts] = useState([]);
  const [displayBalances, setDisplayBalances] = useState({});
  const [paymentInputs, setPaymentInputs] = useState({});
  const [dueDates, setDueDates] = useState({});

  const [goal, setGoal] = useState("");

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState([]);
  const [animateBadge, setAnimateBadge] = useState(null);

  const [freeUses, setFreeUses] = useState(0);
  const FREE_LIMIT = 60;

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [due, setDue] = useState("");

  const trialActive = freeUses < FREE_LIMIT;

  useEffect(() => {
    const used = localStorage.getItem("freeUses");
    if (used) setFreeUses(parseInt(used));
  }, []);

  /* 🧠 COACH */
  const getCoach = () => {
    if (debts.length === 0) return "Start by adding your first account";

    const highest = debts.reduce((a, b) =>
      (a.rate || 0) > (b.rate || 0) ? a : b
    );

    return `💡 Focus on ${highest.name} first`;
  };

  /* 🎮 XP */
  const addXP = (amt) => {
    let newXP = xp + amt;
    let newLevel = level;

    if (newXP >= level * 100) {
      newXP -= level * 100;
      newLevel++;
      unlockBadge("Level Up 🚀");
      confetti();
    }

    setXp(newXP);
    setLevel(newLevel);
  };

  /* 🏆 BADGE */
  const unlockBadge = (name) => {
    if (!badges.includes(name)) {
      setBadges((b) => [...b, name]);
      setAnimateBadge(name);
      setTimeout(() => setAnimateBadge(null), 1000);
    }
  };

  /* ➕ ADD */
  const addDebt = () => {
    if (!name || !balance) return;

    const newDebt = {
      name,
      balance: parseFloat(balance),
      rate: 10,
    };

    setDebts([...debts, newDebt]);

    setDisplayBalances({
      ...displayBalances,
      [debts.length]: newDebt.balance,
    });

    setDueDates({
      ...dueDates,
      [debts.length]: due,
    });

    unlockBadge("First Account 💳");

    setName("");
    setBalance("");
    setDue("");
  };

  /* 💸 PAYMENT */
  const applyPayment = (i) => {
    if (!trialActive) {
      alert("🔒 Trial ended. Upgrade required.");
      return;
    }

    const amount = parseFloat(paymentInputs[i]);
    if (!amount) return;

    let updated = [...debts];
    let start = updated[i].balance;
    let end = Math.max(0, start - amount);

    animateValue(start, end, 400, (val) => {
      setDisplayBalances((prev) => ({
        ...prev,
        [i]: val,
      }));
    });

    updated[i].balance = end;

    if (end === 0) {
      unlockBadge("Debt Destroyed 💥");
      confetti();
    }

    setDebts(updated);
    addXP(15);

    const count = freeUses + 1;
    setFreeUses(count);
    localStorage.setItem("freeUses", count);
  };

  const total = debts.reduce((s, d) => s + d.balance, 0);
  const progress = goal ? Math.min((1 - total / goal) * 100, 100) : 0;

  return (
    <main style={styles.main}>
      {/* BRAND HEADER */}
      <div style={styles.header}>
        <h1>💸 Debt Planner</h1>
        <p>by RA Customs</p>
        <h2>${total.toFixed(2)}</h2>
      </div>

      {/* NAV */}
      <div style={styles.tabs}>
        <button
          style={tab === "dashboard" ? styles.activeTab : styles.tab}
          onClick={() => setTab("dashboard")}
        >
          🏠
        </button>
        <button
          style={tab === "coach" ? styles.activeTab : styles.tab}
          onClick={() => setTab("coach")}
        >
          🧠
        </button>
        <button
          style={tab === "achievements" ? styles.activeTab : styles.tab}
          onClick={() => setTab("achievements")}
        >
          🏆
        </button>
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <>
          <div style={styles.card}>
            <p>Trial: {freeUses}/{FREE_LIMIT}</p>
          </div>

          <div style={styles.card}>
            <h3>🎯 Goal</h3>
            <input onChange={(e) => setGoal(parseFloat(e.target.value))} />
            <div style={styles.bar}>
              <div style={{ ...styles.fill, width: `${progress}%` }} />
            </div>
          </div>

          <div style={styles.card}>
            <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
            <input placeholder="Balance" onChange={(e) => setBalance(e.target.value)} />
            <input type="date" onChange={(e) => setDue(e.target.value.slice(5))} />
            <button onClick={addDebt}>Add</button>
          </div>

          {debts.map((d, i) => (
            <div key={i} style={styles.account}>
              <div>
                <strong>{d.name}</strong>
                <p>${(displayBalances[i] ?? d.balance).toFixed(2)}</p>
                <small>Due: {dueDates[i] || "--"}</small>
              </div>

              <div>
                <input
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
        </>
      )}

      {/* COACH */}
      {tab === "coach" && (
        <div style={styles.card}>
          <h3>🧠 Coach</h3>
          <p>{getCoach()}</p>
        </div>
      )}

      {/* ACHIEVEMENTS */}
      {tab === "achievements" && (
        <div style={styles.card}>
          <h3>🏆 Achievements</h3>
          <div style={styles.badgeGrid}>
            {badges.map((b, i) => (
              <div
                key={i}
                style={{
                  ...styles.badge,
                  transform:
                    animateBadge === b ? "scale(1.2)" : "scale(1)",
                }}
              >
                {b}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

/* 🎨 STYLES */
const styles = {
  main: {
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    padding: 20,
  },
  header: {
    textAlign: "center",
    marginBottom: 15,
  },
  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    padding: 10,
    background: "#1e293b",
    border: "none",
    borderRadius: 8,
    color: "white",
  },
  activeTab: {
    flex: 1,
    padding: 10,
    background: "#2563eb",
    border: "none",
    borderRadius: 8,
    color: "white",
  },
  card: {
    background: "#1e293b",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  account: {
    display: "flex",
    justifyContent: "space-between",
    background: "#020617",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    width: 60,
  },
  bar: {
    height: 8,
    background: "#334155",
  },
  fill: {
    height: "100%",
    background: "#22c55e",
  },
  badgeGrid: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    background: "#22c55e",
    padding: "5px 10px",
    borderRadius: 6,
  },
};
