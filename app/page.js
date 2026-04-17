"use client";
import { useState } from "react";
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

    data.push({
      month,
      balance: Math.round(remaining)
    });
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

  return (
    <main style={{ padding: 30, maxWidth: 600, margin: "auto", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>Debt Freedom Planner 💸</h1>

      <div style={{ border: "1px solid #ddd", padding: 15, borderRadius: 8 }}>
        <h3>Add Debt</h3>
        <input placeholder="Debt Name" value={name} onChange={e => setName(e.target.value)} /><br /><br />
        <input placeholder="Balance" value={balance} onChange={e => setBalance(e.target.value)} /><br /><br />
        <input placeholder="Interest %" value={interest} onChange={e => setInterest(e.target.value)} /><br /><br />
        <input placeholder="Minimum Payment" value={minimum} onChange={e => setMinimum(e.target.value)} /><br /><br />
        <button onClick={addDebt}>Add Debt</button>
      </div>

      {debts.length > 0 && (
        <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 15, borderRadius: 8 }}>
          <h3>Your Debts</h3>
          {debts.map((d, i) => (
            <div key={i}>
              <b>{d.name}</b> - ${d.balance} @ {d.interest}%
            </div>
          ))}
          <p><b>Total Debt:</b> ${totalDebt.toFixed(2)}</p>
        </div>
      )}

      <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 15, borderRadius: 8 }}>
        <h3>Plan Settings</h3>
        <input placeholder="Extra Monthly Payment" value={extra} onChange={e => setExtra(e.target.value)} /><br /><br />

        <button onClick={() => setMethod("snowball")}>Snowball</button>
        <button onClick={() => setMethod("avalanche")} style={{ marginLeft: 10 }}>Avalanche</button>

        <br /><br />
        <button onClick={calculate}>Calculate Plan</button>
      </div>

      {result && (
        <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 15, borderRadius: 8 }}>
          <h2>Your Plan</h2>
          <p><b>Debt-free in:</b> {result.month} months</p>
          <p><b>Payoff date:</b> {result.payoffDate}</p>
          <p><b>Total interest:</b> ${result.totalInterest.toFixed(2)}</p>
          <p><b>You save:</b> ${result.interestSaved.toFixed(2)}</p>

          <div style={{ marginTop: 10 }}>
            <b>Progress:</b>
            <div style={{ background: "#eee", height: 10 }}>
              <div style={{ width: `${result.progress}%`, background: "green", height: "100%" }} />
            </div>
            <p>{result.progress.toFixed(1)}%</p>
          </div>

          <h3>Debt Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={result.data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="balance" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  );
}
