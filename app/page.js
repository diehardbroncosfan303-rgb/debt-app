"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* 🎉 CONFETTI */
const confetti = () => {
  for (let i = 0; i < 60; i++) {
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

/* 📊 SIMULATION */
function simulate(debts, extra) {
  let total = debts.reduce((s, d) => s + d.balance, 0);
  let data = [];
  let month = 0;

  let current = debts.map((d) => ({ ...d }));

  while (total > 0 && month < 240) {
    month++;

    current = current.map((d) => {
      let interest = d.balance * (d.rate / 100 / 12);
      let payment = d.min + (extra || 0);
      let newBal = Math.max(0, d.balance + interest - payment);
      return { ...d, balance: newBal };
    });

    total = current.reduce((s, d) => s + d.balance, 0);

    data.push({ month, balance: Math.round(total) });
  }

  return data;
}

export default function Page() {
  /* 🔑 STATE */
  const [premium, setPremium] = useState(false);
  const [debts, setDebts] = useState([]);
  const [data, setData] = useState([]);
  const [extra, setExtra] = useState("");
  const [achievements, setAchievements] = useState([]);

  const [freeUses, setFreeUses] = useState(0);
  const FREE_LIMIT = 5;

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("");
  const [min, setMin] = useState("");

  /* 💳 STRIPE */
  const upgrade = async () => {
    const res = await fetch(`${window.location.origin}/api/checkout`, {
      method: "POST",
    });
    const d = await res.json();
    if (!d.url) return alert(d.error);
    window.location.href = d.url;
  };

  /* LOAD STATE */
  useEffect(() => {
    if (localStorage.getItem("premium") === "true") setPremium(true);

    const used = localStorage.getItem("freeUses");
    if (used) setFreeUses(parseInt(used));

    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      localStorage.setItem("premium", "true");
      setPremium(true);
      alert("🎉 Premium unlocked!");
    }
  }, []);

  /* ➕ ADD DEBT */
  const addDebt = () => {
    if (!name || !balance || !rate || !min) return;

    setDebts([
      ...debts,
      {
        name,
        balance: parseFloat(balance),
        rate: parseFloat(rate),
        min: parseFloat(min),
      },
    ]);

    setName("");
    setBalance("");
    setRate("");
    setMin("");
  };

  /* 💸 PAY DEBT */
  const payDebt = (i) => {
    if (!premium && freeUses >= FREE_LIMIT) {
      alert("🔒 Free limit reached. Upgrade to continue.");
      return upgrade();
    }

    let updated = [...debts];

    updated[i].balance = Math.max(
      0,
      updated[i].balance - updated[i].min
    );

    if (updated[i].balance === 0) {
      confetti();
      setAchievements((a) => [...a, `Paid off ${updated[i].name}`]);
    }

    setDebts(updated);

    if (!premium) {
      const newCount = freeUses + 1;
      setFreeUses(newCount);
      localStorage.setItem("freeUses", newCount);
    }

    const result = simulate(updated, parseFloat(extra));
    setData(result);
  };

  /* 📊 CALCULATE */
  const calculate = () => {
    if (!premium) return upgrade();
    const result = simulate(debts, parseFloat(extra));
    setData(result);
  };

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);

  return (
    <main style={styles.main}>
      <h1>💸 Debt Planner</h1>

      {/* DASHBOARD */}
      <div style={styles.card}>
        <h2>Total Debt: ${totalDebt.toFixed(0)}</h2>

        {!premium && (
          <p>
            Free uses left: {Math.max(0, FREE_LIMIT - freeUses)}
          </p>
        )}

        <button onClick={upgrade} style={styles.btn}>
          {premium ? "Premium Active" : "Upgrade 💳"}
        </button>
      </div>

      {/* ADD */}
      <div style={styles.card}>
        <h3>Add Debt</h3>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Balance" value={balance} onChange={(e) => setBalance(e.target.value)} />
        <input placeholder="Interest %" value={rate} onChange={(e) => setRate(e.target.value)} />
        <input placeholder="Min Payment" value={min} onChange={(e) => setMin(e.target.value)} />
        <button onClick={addDebt}>Add</button>
      </div>

      {/* LIST */}
      <div style={styles.card}>
        <h3>Your Debts</h3>

        {debts.map((d, i) => (
          <div key={i} style={styles.row}>
            <div>
              <strong>{d.name}</strong>
              <p>${d.balance.toFixed(0)}</p>
            </div>

            <button onClick={() => payDebt(i)} style={styles.payBtn}>
              {premium ? "Pay 💸" : "Try 💸"}
            </button>
          </div>
        ))}
      </div>

      {/* PLAN */}
      <div style={styles.card}>
        <h3>Plan</h3>
        <input
          placeholder="Extra Monthly"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
        />
        <button onClick={calculate}>
          {premium ? "Calculate" : "Unlock Premium 💳"}
        </button>
      </div>

      {/* CHART */}
      {premium && data.length > 0 && (
        <div style={styles.card}>
          <h3>Projection</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="balance"
                stroke="#22c55e"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ACHIEVEMENTS */}
      {premium && achievements.length > 0 && (
        <div style={styles.card}>
          <h3>🏆 Achievements</h3>
          {achievements.map((a, i) => (
            <p key={i}>✅ {a}</p>
          ))}
        </div>
      )}
    </main>
  );
}

/* 🎨 STYLES */
const styles = {
  main: {
    padding: 20,
    maxWidth: 900,
    margin: "auto",
    fontFamily: "sans-serif",
  },
  card: {
    background: "#f1f5f9",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  btn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 6,
  },
  payBtn: {
    background: "#22c55e",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    color: "white",
    cursor: "pointer",
  },
};
