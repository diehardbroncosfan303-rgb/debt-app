"use client";
import { useState } from "react";

export default function Page() {
  const [debts, setDebts] = useState([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [interest, setInterest] = useState("");
  const [minimum, setMinimum] = useState("");
  const [extra, setExtra] = useState("");
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
    let sorted = [...debts].sort((a, b) => a.balance - b.balance);
    let month = 0;
    let totalInterest = 0;

    while (sorted.some((d) => d.balance > 0) && month < 600) {
      month++;
      let extraPay = parseFloat(extra) || 0;

      for (let d of sorted) {
        if (d.balance <= 0) continue;

        let rate = d.interest / 100 / 12;
        let interest = d.balance * rate;
        totalInterest += interest;
        d.balance += interest;

        let payment = d.minimum;
        let target = sorted.find((x) => x.balance > 0);

        if (d === target) payment += extraPay;

        payment = Math.min(payment, d.balance);
        d.balance -= payment;
      }
    }

    setResult({ month, totalInterest });
  };

  return (
    <main style={{ padding: 30, maxWidth: 500, margin: "auto" }}>
      <h1>Debt Freedom Planner 💸</h1>

      <input placeholder="Debt Name" value={name} onChange={(e) => setName(e.target.value)} /><br /><br />
      <input placeholder="Balance" value={balance} onChange={(e) => setBalance(e.target.value)} /><br /><br />
      <input placeholder="Interest %" value={interest} onChange={(e) => setInterest(e.target.value)} /><br /><br />
      <input placeholder="Minimum Payment" value={minimum} onChange={(e) => setMinimum(e.target.value)} /><br /><br />

      <button onClick={addDebt}>Add Debt</button>

      <hr />

      <input placeholder="Extra Monthly Payment" value={extra} onChange={(e) => setExtra(e.target.value)} /><br /><br />

      <button onClick={calculate}>Calculate</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Results</h2>
          <p>Debt free in {result.month} months</p>
          <p>Total interest paid: ${result.totalInterest.toFixed(2)}</p>
        </div>
      )}
    </main>
  );
}
