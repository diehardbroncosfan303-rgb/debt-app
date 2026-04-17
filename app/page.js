"use client";
import { useState } from "react";

function simulate(debts, extra, method) {
  let sorted = [...debts];

  if (method === "snowball") {
    sorted.sort((a, b) => a.balance - b.balance);
  } else {
    sorted.sort((a, b) => b.interest - a.interest);
  }

  let month = 0;
  let totalInterest = 0;

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
  }

  return { month, totalInterest };
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

  return (
    <main style={{ padding: 30, maxWidth: 500, margin: "auto", fontFamily: "Arial" }}>
      <h1>Debt Freedom Planner 💸</h1>

      <h3>Add Debt</h3>
      <input placeholder="Debt Name" value={name} onChange={e => setName(e.target.value)} /><br /><br />
      <input placeholder="Balance" value={balance} onChange={e => setBalance(e.target.value)} /><br /><br />
      <input placeholder="Interest %" value={interest} onChange={e => setInterest(e.target.value)} /><br /><br />
      <input placeholder="Minimum Payment" value={minimum} onChange={e => setMinimum(e.target.value)} /><br /><br />

      <button onClick={addDebt}>Add Debt</button>

      <hr />

      <h3>Plan Settings</h3>
      <input placeholder="Extra Monthly Payment" value={extra} onChange={e => setExtra(e.target.value)} /><br /><br />

      <div>
        <button onClick={() => setMethod("snowball")}>
          Snowball
        </button>
        <button onClick={() => setMethod("avalanche")} style={{ marginLeft: 10 }}>
          Avalanche
        </button>
      </div>

      <br />
      <button onClick={calculate}>Calculate Plan</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Your Plan</h2>
          <p><b>Debt-free in:</b> {result.month} months</p>
          <p><b>Payoff date:</b> {result.payoffDate}</p>
          <p><b>Total interest:</b> ${result.totalInterest.toFixed(2)}</p>
          <p><b>You save:</b> ${result.interestSaved.toFixed(2)}</p>
        </div>
      )}
    </main>
  );
}
