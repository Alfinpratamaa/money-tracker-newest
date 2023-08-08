import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [name, setName] = useState("");
  const [datetime, setDatetime] = useState("");
  const [description, setDescription] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (id) => {
    if (menuOpen === id) {
      setMenuOpen(null);
    } else {
      setMenuOpen(id);
    }
  };

  useEffect(() => {
    getTransactions().then(setTransactions);
  }, []);

  async function getTransactions() {
    const url =
      "https://api-money-checker-81h2dbe3n-alfinpratamaa.vercel.app" +
      "/transactions";
    const response = await fetch(url);
    return await response.json();
  }

  const addNewTransaction = (e) => {
    e.preventDefault();

    const priceMatch = name.match(/^([+-]?\d+(\.\d+)?)\s/);
    if (!priceMatch) {
      console.log("Invalid format for price.");
      return;
    }

    const url =
      "https://api-money-checker-81h2dbe3n-alfinpratamaa.vercel.app" +
      "/transaction";

    const price = parseFloat(priceMatch[1]);
    fetch(url, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        price,
        name: name.substring(priceMatch[0].length),
        description,
        datetime,
      }),
    })
      .then((response) => {
        console.log("Response status:", response.status);
        response
          .json()
          .then((json) => {
            setName("");
            setDatetime("");
            setDescription("");
            setTransactions([...transactions, json]);
            console.log("Result:", json);
          })
          .catch((error) => {
            console.error("Fetch error:", error);
          });
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);

    const optionsDate = { year: "numeric", month: "2-digit", day: "2-digit" };
    const optionsTime = { hour: "2-digit", minute: "2-digit" };

    const formattedDate = date.toLocaleDateString(undefined, optionsDate);
    const formattedTime = date.toLocaleTimeString(undefined, optionsTime);

    return `${formattedDate} ${formattedTime}`;
  };

  // ...
  const deleteTransaction = (id) => {
    const url =
      "https://api-money-checker-81h2dbe3n-alfinpratamaa.vercel.app" +
      `/transaction/${id}`;

    fetch(url, {
      method: "DELETE",
      headers: { "Content-type": "application/json" },
    })
      .then((response) => {
        console.log("Delete Response status:", response.status);
        if (response.status === 200) {
          setTransactions(
            transactions.filter((transaction) => transaction._id !== id)
          );
        }
      })
      .catch((error) => {
        console.error("Delete Fetch error:", error);
      });
  };

  // ...

  const showDeleteConfirmation = (id) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (confirmation) {
      deleteTransaction(id);
    }
  };

  let balance = 0;
  for (const transaction of transactions) {
    balance += transaction.price;
  }

  balance = balance.toFixed(2);
  const fraction = balance.split(".")[1];
  balance = balance.split(".")[0];

  return (
    <main>
      <h1>
        ${balance}
        <span>{fraction}</span>
      </h1>
      <form onSubmit={addNewTransaction}>
        <div className="basic">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={"+200 new samsung tv"}
            required
          />
          <input
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            type="datetime-local"
            required
          />
        </div>
        <div className="description">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            type="text"
            placeholder="description"
            required
          />
        </div>
        <button type="submit">add new transaction</button>
      </form>
      <div className="transactions">
        {transactions.length > 0 &&
          transactions.map((transaction) => (
            <div className="transaction" key={transaction._id}>
              <div className="left">
                <div className="name">{transaction.name}</div>
                <div className="description">{transaction.description}</div>
              </div>
              <div className="right">
                <div
                  className={`menu ${
                    menuOpen === transaction._id ? "active" : ""
                  }`}
                >
                  <button
                    className="menu-btn"
                    onClick={() => toggleMenu(transaction._id)}
                  >
                    ...
                  </button>
                  <div className="dropdown-content">
                    <button
                      onClick={() => showDeleteConfirmation(transaction._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div
                  className={
                    "price " + (transaction.price < 0 ? "red" : "green")
                  }
                >
                  {transaction.price >= 0 ? "+" : ""}
                  {transaction.price}
                </div>
                <div className="datetime">
                  {formatDate(transaction.datetime)}
                </div>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
