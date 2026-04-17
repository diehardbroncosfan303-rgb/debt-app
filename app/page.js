"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
  const [result, setResult] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  const bg = darkMode ? "#0b1220" : "#f4f7fb";
  const card = darkMode ? "#121a2b" : "#ffffff";
  const text = darkMode ? "#e6edf6" : "#0f172a";
  const accent = "#22c55e";

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

    setName(""); setBalance(""); setInterest(""); setMinimum("");
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

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  return (
    <main style={{
      padding: 20,
      maxWidth: 700,
      margin: "auto",
      background: bg,
      color: text,
      minHeight: "100vh"
    }}>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>💸 Debt Planner</h1>
        <p style={{ opacity: 0.6 }}>RA Customs</p>
      </div>

      {/* DASHBOARD CARD */}
      <div className="card">
        <h3>Overview</h3>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ opacity: 0.6 }}>Total Debt</p>
            <h2>${totalDebt.toFixed(2)}</h2>
          </div>

          {result && (
            <div style={{ textAlign: "right" }}>
              <p style={{ opacity: 0.6 }}>Saved</p>
              <h2 style={{ color: accent }}>
                ${result.interestSaved.toFixed(0)}
              </h2>
            </div>
          )}
        </div>

        {result && (
          <>
            <div className="progress">
              <div
                className="progressFill"
                style={{ width: `${result.progress}%` }}
              />
            </div>
            <p>{result.progress.toFixed(1)}% complete</p>
          </>
        )}
      </div>

      {/* ADD DEBT */}
      <div className="card">
        <h3>Add Debt</h3>

        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Balance" value={balance} onChange={e => setBalance(e.target.value)} />
        <input placeholder="Interest %" value={interest} onChange={e => setInterest(e.target.value)} />
        <input placeholder="Minimum" value={minimum} onChange={e => setMinimum(e.target.value)} />

        <button className="btn" onClick={addDebt}>Add</button>
      </div>

      {/* PLAN */}
      <div className="card">
        <h3>Plan</h3>

        <input placeholder="Extra Monthly Payment" value={extra} onChange={e => setExtra(e.target.value)} />

        <button className="btn primary" onClick={calculate}>
          Calculate Plan
        </button>
      </div>

      {/* GRAPH */}
      {result && (
        <div className="card">
          <h3>Projection</h3>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={result.data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke={accent} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ textAlign: "center", marginTop: 30, opacity: 0.5 }}>
        Built by RA Customs
      </div>

      {/* STYLES */}
      <style>{`
        .card {
          background: ${card};
          padding: 18px;
          border-radius: 16px;
          margin-bottom: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        input {
          width: 100%;
          margin: 6px 0;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        .btn {
          margin-top: 10px;
          padding: 10px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          background: #e2e8f0;
        }

        .btn.primary {
          background: #22c55e;
          color: white;
        }

        .progress {
          background: #ddd;
          height: 8px;
          border-radius: 6px;
          margin-top: 10px;
          overflow: hidden;
        }

        .progressFill {
          height: 100%;
          background: #22c55e;
          transition: width 0.5s;
        }
      `}</style>

    </main>
  );
}
