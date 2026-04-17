"use client";
import { useState, useEffect } from "react";
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

  // 🔥 Monthly tracking
  const [payment, setPayment] = useState("");
  const [streak, setStreak] = useState(0);
  const [status, setStatus] = useState("Not started");

  useEffect(() => {
    const savedStreak = localStorage.getItem("monthlyStreak");
    if (savedStreak) setStreak(parseInt(savedStreak));
  }, []);

  useEffect(() => {
    localStorage.setItem("monthlyStreak", streak);
  }, [streak]);

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

  // 🔥 Track monthly payment
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
  const bg = darkMode ? "#111" : "#fff";
  const text = darkMode ? "#fff" : "#000";

  const getMessage = () => {
    if (!result) return "Let’s build your plan 💪";
    if (result.progress >= 100) return "YOU DID IT 🎉";
    if (status.includes("Behind")) return "Let’s get back on track 💪";
    if (streak >= 3) return "You're crushing it 🔥";
    return "Stay consistent 👍";
  };

  return (
    <main style={{ padding: 30, maxWidth: 600, margin: "auto", background: bg, color: text }}>
      <h1 style={{ textAlign: "center" }}>Debt Freedom Planner 💸</h1>

      {/* 🔥 Monthly streak */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        🔥 {streak} month{streak !== 1 ? "s" : ""} on track
      </div>

      <div style={{ textAlign: "center", marginBottom: 10 }}>
        Status: {status}
      </div>

      {/* Theme */}
      <div>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <button onClick={() => setDarkMode(!darkMode)} style={{ marginLeft: 10 }}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Coach */}
      <div style={{ textAlign: "center", marginTop: 10 }}>
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

      <button style={{ background: color, color: "#fff" }} onClick={calculate}>Calculate Plan</button>

      <hr />

      {/* 💰 Monthly payment tracker */}
      <h3>Log Monthly Payment</h3>
      <input placeholder="Amount Paid" value={payment} onChange={(e) => setPayment(e.target.value)} />
      <button style={{ marginLeft: 10 }} onClick={logPayment}>Log Payment</button>

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

          <h3>{result.progress.toFixed(1)}%</h3>

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
