"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// PWA metadata
export const metadata = {
  title: "Debt Freedom Planner",
  description: "Track and eliminate your debt",
  manifest: "/manifest.json",
};

function simulate(debts, extra) {
  let sorted = [...debts].sort((a, b) => a.balance - b.balance);

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

    data.push({
      month,
      balance: Math.round(remaining)
    });
  }

  let progress =
    startBalance > 0
      ? ((startBalance - remaining) / startBalance) * 100
      : 0;

  return { month, totalInterest, progress, data };
}

export default function Page() {
  const [debts, setDebts] = useState([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [interest, setInterest] = useState("");
  const [minimum, setMinimum] = useState("");
  const [extra, setExtra] = useState("");
  const [result, setResult] = useState(null);

  const [color, setColor] = useState("#22c55e");
  const [darkMode, setDarkMode] = useState(false);

  const [payment, setPayment] = useState("");
  const [streak, setStreak] = useState(0);
  const [status, setStatus] = useState("Not started");

  // Load saved settings
  useEffect(() => {
    const savedStreak = localStorage.getItem("monthlyStreak");
    const savedColor = localStorage.getItem("color");
    const savedMode = localStorage.getItem("darkMode");

    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedColor) setColor(savedColor);
    if (savedMode === "true") setDarkMode(true);
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem("monthlyStreak", streak);
    localStorage.setItem("color", color);
    localStorage.setItem("darkMode", darkMode);
  }, [streak, color, darkMode]);

  // Register service worker (PWA)
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

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
    const base = simulate(debts, extra);
    const noExtra = simulate(debts, 0);

    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + base.month);

    setResult({
      ...base,
      interestSaved: noExtra.totalInterest - base.totalInterest,
      payoffDate: payoffDate.toLocaleDateString(),
    });
  };

  const logPayment = () => {
    const required = debts.reduce((sum, d) => sum + d.minimum, 0);
    const paid = parseFloat(payment);

    if (!paid) return;

    if (paid >= required) {
      setStreak(prev => prev + 1);
      setStatus("On Track ✅");
    } else {
      setStreak(0);
      setStatus("Behind ⚠️");
    }

    setPayment("");
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  const bg = darkMode ? "#0f172a" : "#f8fafc";
  const card = darkMode ? "#1e293b" : "#ffffff";
  const text = darkMode ? "#e2e8f0" : "#0f172a";

  const getMessage = () => {
    if (!result) return "Let’s build your plan 💪";
    if (result.progress >= 100) return "YOU DID IT 🎉🔥";
    if (status.includes("Behind")) return "Let’s get back on track 💪";
    if (streak >= 3) return "You're crushing it 🔥";
    return "Stay consistent 👍";
  };

  return (
    <main style={{
      padding: 30,
      maxWidth: 650,
      margin: "auto",
      background: bg,
      color: text,
      minHeight: "100vh"
    }}>

      <h1 style={{ textAlign: "center", marginBottom: 20 }}>
        Debt Freedom Planner 💸
      </h1>

      {/* Controls */}
      <div style={{ marginBottom: 15 }}>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginLeft: 10 }}>
          {darkMode ? "Light" : "Dark"}
        </button>
      </div>

      {/* Coach */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        🤖 {getMessage()}
      </div>

      {/* Streak */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        🔥 {streak} month{streak !== 1 ? "s" : ""} on track
      </div>

      <div style={{ textAlign: "center", marginBottom: 15 }}>
        Status: {status}
      </div>

      {/* Add Debt */}
      <div style={{ background: card, padding: 20, borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <h3>Add Debt</h3>

        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} /><br /><br />
        <input placeholder="Balance" value={balance} onChange={e => setBalance(e.target.value)} /><br /><br />
        <input placeholder="Interest %" value={interest} onChange={e => setInterest(e.target.value)} /><br /><br />
        <input placeholder="Minimum" value={minimum} onChange={e => setMinimum(e.target.value)} /><br /><br />

        <button className="btn" style={{ background: color }} onClick={addDebt}>
          Add Debt
        </button>
      </div>

      {/* Total */}
      {debts.length > 0 && (
        <div style={{ marginTop: 15 }}>
          <b>Total Debt:</b> ${totalDebt.toFixed(2)}
        </div>
      )}

      {/* Plan */}
      <div style={{ marginTop: 20, background: card, padding: 20, borderRadius: 12 }}>
        <h3>Plan</h3>

        <input placeholder="Extra Payment" value={extra} onChange={e => setExtra(e.target.value)} /><br /><br />

        <button className="btn" style={{ background: color }} onClick={calculate}>
          Calculate Plan
        </button>
      </div>

      {/* Payment tracker */}
      <div style={{ marginTop: 20 }}>
        <h3>Log Monthly Payment</h3>
        <input placeholder="Amount Paid" value={payment} onChange={(e) => setPayment(e.target.value)} />
        <button onClick={logPayment} style={{ marginLeft: 10 }}>
          Log
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="resultBox">
          <h2>Your Plan</h2>

          <p>{result.month} months</p>
          <p>{result.payoffDate}</p>

          <p style={{ fontSize: 18 }}>
            💰 Saved: <span className="highlight">
              ${result.interestSaved.toFixed(2)}
            </span>
          </p>

          <div className="progress">
            <div
              className="progressFill"
              style={{ width: `${result.progress}%`, background: color }}
            />
          </div>

          <p>{result.progress.toFixed(1)}%</p>

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

      {/* Branding */}
      <div style={{
        textAlign: "center",
        marginTop: 40,
        paddingTop: 10,
        borderTop: "1px solid #ccc",
        fontSize: 13,
        opacity: 0.7
      }}>
        ⚡ Built by <b>RA Customs</b>
      </div>

      {/* Styles */}
      <style>{`
        .btn {
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.2s;
        }

        .btn:active {
          transform: scale(0.95);
        }

        .btn:hover {
          box-shadow: 0 0 10px rgba(0,255,0,0.4);
        }

        .resultBox {
          margin-top: 20px;
          padding: 20px;
          border-radius: 12px;
          background: ${card};
          box-shadow: 0 0 20px rgba(0,255,0,0.2);
          animation: fadeIn 0.4s ease;
        }

        .highlight {
          color: #22c55e;
          font-weight: bold;
          animation: glow 1.5s infinite alternate;
        }

        .progress {
          background: #ccc;
          height: 10px;
          border-radius: 5px;
          overflow: hidden;
        }

        .progressFill {
          height: 100%;
          transition: width 0.6s ease;
        }

        @keyframes glow {
          from { text-shadow: 0 0 5px #22c55e; }
          to { text-shadow: 0 0 15px #22c55e; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </main>
  );
}
