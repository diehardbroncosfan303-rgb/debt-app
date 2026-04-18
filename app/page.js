"use client";
import { useState, useEffect } from "react";

/* 🎉 CONFETTI */
const confetti = () => {
  for (let i = 0; i < 40; i++) {
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
      { duration: 900 }
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

  /* LOAD */
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
      setTimeout(() => setAnimateBadge(null), 1200);
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

  const today = new Date().toISOString().slice(5, 10);

  return (
    <main style={styles.main}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1>Debt Planner</h1>
        <p>Total Balance</p>
        <h2>${total.toFixed(2)}</h2>
      </div>

      {/* REMINDER */}
      {Object.values(dueDates).includes(today) && (
        <div style={styles.alert}>
          ⚠️ A bill is due today
        </div>
      )}

      {/* TRIAL */}
      <div style={styles.card}>
        <p>
          Trial: {freeUses}/{FREE_LIMIT}
        </p>
      </div>

      {/* GOAL */}
      <div style={styles.card}>
        <h3>🎯 Goal</h3>
        <input
          placeholder="Target amount"
          onChange={(e) => setGoal(parseFloat(e.target.value))}
        />
        <div style={styles.bar}>
          <div style={{ ...styles.fill, width: `${progress}%` }} />
        </div>
      </div>

      {/* COACH */}
      <div style={styles.card}>
        <h3>🧠 Coach</h3>
        <p>{getCoach()}</p>
      </div>

      {/* LEVEL */}
      <div style={styles.card}>
        <h3>Level {level}</h3>
        <div style={styles.bar}>
          <div
            style={{
              ...styles.fill,
              width: `${(xp / (level * 100)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* ADD */}
      <div style={styles.card}>
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input placeholder="Balance" onChange={(e) => setBalance(e.target.value)} />
        <input type="date" onChange={(e) => setDue(e.target.value.slice(5))} />
        <button onClick={addDebt}>Add</button>
      </div>

      {/* ACCOUNTS */}
      {debts.map((d, i) => (
        <div key={i} style={styles.account}>
          <div>
            <strong>{d.name}</strong>
            <p>${(displayBalances[i] ?? d.balance).toFixed(2)}</p>
            <small>Due: {dueDates[i] || "--"}</small>
          </div>

          <div>
            <input
              placeholder="$"
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

      {/* BADGES */}
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
                boxShadow:
                  animateBadge === b ? "0 0 15px gold" : "none",
              }}
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* 🎨 STYLES */
const styles = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#0f172a,#020617)",
    padding: 20,
    color: "white",
    fontFamily: "system-ui",
  },
  header: {
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    padding: 25,
    borderRadius: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  alert: {
    background: "#f59e0b",
    color: "black",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  card: {
    background: "#1e293b",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  account: {
    background: "#0f172a",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
  },
  input: {
    width: 60,
    marginRight: 5,
  },
  bar: {
    height: 8,
    background: "#334155",
    borderRadius: 10,
  },
  fill: {
    height: "100%",
    background: "#22c55e",
  },
  badgeGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    background: "#22c55e",
    padding: "6px 10px",
    borderRadius: 8,
    transition: "0.3s",
  },
};
