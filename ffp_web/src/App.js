// App.js
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ABI, SCAddress } from "./Env";
import TransferForm from "./components/TransferForm";
import HistoryTxns from "./components/HistoryTxns";
import Deposit from "./components/Deposit";
import "./App.css";
import Withdraw from "./components/Withdraw";

function App() {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState(null);

  // View controller: 'payment' | 'history' | 'deposit'
  const [activeView, setActiveView] = useState("payment");

  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);
        const signer = await browserProvider.getSigner();
        setSigner(signer);
        setAddress(await signer.getAddress());
      }
    };
    initializeProvider();
  }, []);

  useEffect(() => {
    const getContract = async () => {
      if (provider && signer) {
        const c = new ethers.Contract(SCAddress, ABI, signer);
        setContract(c);

        // Example: retrieve contract's "balance" for the connected user
        const balanceBn = await c.getBalance();
        const formatted = ethers.formatEther(balanceBn);
        setBalance(Number(formatted));
      }
    };
    getContract();
  }, [provider, signer]);

  // Simple navigation bar for switching views
  const renderNavigation = () => {
    return (
      <nav className="app-nav">
        <button
          className={activeView === "payment" ? "active" : ""}
          onClick={() => setActiveView("payment")}
        >
          Payment
        </button>
        <button
          className={activeView === "history" ? "active" : ""}
          onClick={() => setActiveView("history")}
        >
          History
        </button>
        <button
          className={activeView === "deposit" ? "active" : ""}
          onClick={() => setActiveView("deposit")}
        >
          Deposit
        </button>
        <button
          className={activeView === "withdraw" ? "active" : ""}
          onClick={() => setActiveView("withdraw")}
        >
          Withdraw
        </button>
      </nav>
    );
  };

  // Conditionally render one of the features
  const renderActiveFeature = () => {
    if (activeView === "payment") {
      return <TransferForm contract={contract} />;
    } else if (activeView === "history") {
      return <HistoryTxns contract={contract} />;
    } else if (activeView === "deposit") {
      return <Deposit contract={contract} />;
    } else if (activeView === "withdraw") {
      return <Withdraw contract={contract} />;
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Financial Fairplay</h1>
      <div className="app-status">
        <p>Address: {address}</p>
        <p>Balance in FFP Contract: {balance} ETH</p>
      </div>

      {renderNavigation()}

      <div className="app-content">
        {renderActiveFeature()}
      </div>
    </div>
  );
}

export default App;
