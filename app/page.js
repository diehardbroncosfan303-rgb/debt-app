"use client";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function simulate(debts, extra, method) {
  let sorted = [...debts];

  if (method === "snowball") {
    sorted.sort((a, b) => a.balance - b.balance);
  } else {
    sorted.sort((a, b) => b.interest - a.interest);
  }

  let month = 0;
  let totalInterest = 0;
  let startBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  let remaining = startBalance;
  let data = [];

  while (sorted.some(d => d.balance > 0) && month < 600) {
    month++;
    let extraPay = parseFloat(extra) || 0;

    for (let d of sorted) {
      if (d.balance <= 0) continue;

      let rate = d.interest / 100 / 12;
      let interest = d.balance * rate;
      totalInterest += interest;
      d.balance += interest;

      let payment = d.minimum;
      let target = sorted.find(x => x.balance > 0);

      if (d === target) payment += extraPay;

      payment = Math.min(payment, d.balance);
      d.balance -= payment;
    }

    remaining = sorted.reduce((sum, d) => sum + d.balance, 0);

    data.push({ month, balance: Math.round(remaining) });
  }

  let progress = startBalance > 0 ? ((startBalance - remaining) / startBalance) * 100 : 0;

  return { month, totalInterest, progress, data };
}

export default function Page() {
  const [debts, setDebts] = useState([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [interest, setInterest] = useState("");
  const [minimum, setMinimum] = useState("");
  const [extra, setExtra] = useState("");
  const [method, setMethod] = useState("snowball");
  const [result, setResult] = useState(null);

  const [color, setColor] = useState("#22c55e");
  const [darkMode, setDarkMode] = useState(false);
  const [milestone, setMilestone] = useState(0);

  // Save settings
  useEffect(() => {
    const savedColor = localStorage.getItem("color");
    const savedMode = localStorage.getItem("darkMode");
    if (savedColor) setColor(savedColor);
    if (savedMode === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("color", color);
    localStorage.setItem("darkMode", darkMode);
  }, [color, darkMode]);

  // 🎉 Milestone logic
  useEffect(() => {
    if (!result) return;

    let p = result.progress;

    if (p >= 100 && milestone < 100) {
      fireConfetti(200);
      setMilestone(100);
    } else if (p >= 75 && milestone < 75) {
      fireConfetti(120);
      setMilestone(75);
    } else if (p >= 50 && milestone < 50) {
      fireConfetti(80);
      setMilestone(50);
    } else if (p >= 25 && milestone < 25) {
      fireConfetti(40);
      setMilestone(25);
    }
  }, [result]);

  const fireConfetti = (count) => {
    confetti({
      particleCount: count,
      spread: 100,
      origin: { y: 0.6 }
    });
  };

  const addDebt = () => {
    if (!name || !balance || !interest || !minimum) return;

    setDebts([
      ...debts,
      {
        name,
        balance: parseFloat(balance),
        interest: parseFloat(interest),
        minimum: parseFloat(minimum),
      },
    ]);

    setName("");
    setBalance("");
    setInterest("");
    setMinimum("");
  };

  const calculate = () => {
    const base = simulate(debts, extra, method);
    const noExtra = simulate(debts, 0, method);

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + base.month);

    setResult({
      ...base,
      interestSaved: noExtra.totalInterest - base.totalInterest,
      payoffDate: payoffDate.toLocaleDateString()
    });
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  const bg = darkMode ? "#111" : "#fff";
  const text = darkMode ? "#fff" : "#000";

  // 🧑 Character messages
  const getMessage = () => {
    if (!result) return "Let's crush your debt 💪";
    if (result.progress >= 100) return "YOU DID IT! 🎉🔥";
    if (result.progress >= 75) return "Almost there!! 🚀";
    if (result.progress >= 50) return "Halfway done, keep pushing 💯";
    if (result.progress >= 25) return "Great start! Stay consistent 👏";
    return "Let’s get started 💪";
  };

  return (
    <main style={{ padding: 30, maxWidth: 600, margin: "auto", background: bg, color: text }}>
      <h1 style={{ textAlign: "center" }}>Debt Freedom Planner 💸</h1>

      {/* Theme */}
      <div>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginLeft: 10 }}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* 🧑 Character */}
      <div style={{
        marginTop: 15,
        padding: 10,
        border: "1px solid #ccc",
        borderRadius: 8,
        textAlign: "center",
        fontWeight: "bold"
      }}>
        🤖 {getMessage()}
      </div>

      <br />

      <input placeholder="Debt Name" value={name} onChange={e => setName(e.target.value)} /><br /><br />
      <input placeholder="Balance" value={balance} onChange={e => setBalance(e.target.value)} /><br /><br />
      <input placeholder="Interest %" value={interest} onChange={e => setInterest(e.target.value)} /><br /><br />
      <input placeholder="Minimum Payment" value={minimum} onChange={e => setMinimum(e.target.value)} /><br /><br />

      <button style={{ background: color, color: "#fff" }} onClick={addDebt}>Add Debt</button>

      {debts.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <b>Total Debt:</b> ${totalDebt.toFixed(2)}
        </div>
      )}

      <hr />

      <input placeholder="Extra Monthly Payment" value={extra} onChange={e => setExtra(e.target.value)} /><br /><br />

      <button style={{ background: color, color: "#fff" }} onClick={calculate}>Calculate</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Your Plan</h2>
          <p>{result.month} months</p>
          <p>{result.payoffDate}</p>
          <p>${result.totalInterest.toFixed(2)}</p>
          <p>Saved: ${result.interestSaved.toFixed(2)}</p>

          <div style={{ background: "#ccc", height: 10 }}>
            <div style={{ width: `${result.progress}%`, background: color, height: "100%" }} />
          </div>

          <h3>Progress: {result.progress.toFixed(1)}%</h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={result.data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke={color} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  );
}
