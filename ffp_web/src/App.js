// App.js
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ABI, SCAddress } from "./Env";
import TransferForm from "./components/TransferForm";
import HistoryTxns from "./components/HistoryTxns";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";
import "./App.css";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [walletType, setWalletType] = useState("");
  const [walletName, setWalletName] = useState("");
  const [clubRev, setClubRev] = useState(0);
  const [spentMoney, setSpentMoney] = useState(0);

  const [activeView, setActiveView] = useState("payment");

  useEffect(() => {
    // Prompt user to connect their wallet
    const initializeProvider = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        const s = await browserProvider.getSigner();
        setSigner(s);

        const userAddress = await s.getAddress();
        setAddress(userAddress);
      }
    };
    initializeProvider();
  }, []);

  useEffect(() => {
    // Once we have a provider & signer, load contract data
    const getContractData = async () => {
      if (!provider || !signer) return;

      const c = new ethers.Contract(SCAddress, ABI, signer);
      setContract(c);

      // 1) Get the user's internal FFP contract balance
      const balanceBn = await c.getBalance(); 
      const formattedBalance = ethers.formatEther(balanceBn);
      setBalance(Number(formattedBalance));

      // 2) Fetch wallet info (name, walletType, internal balance)
      const walletInfo = await c.wallets(address);
      // walletInfo.name, walletInfo.walletType, walletInfo.balance (in Wei)
      console.log("Wallet info: ", walletInfo);

      // Convert wallet type to Title Case
      const rawType = walletInfo.walletType; // e.g. "club", "player", etc.
      const typeString = formatTitleCase(rawType);
      setWalletType(typeString);
      setWalletName(walletInfo.name);

      // 3) If wallet type is "club", fetch clubRevenue & spentClubMoney
      //    Note: The contract uses separate mappings: clubRevenue, spentClubMoney
      if (rawType === "club") {
        const revBn = await c.clubRevenue(address);
        const spentBn = await c.spentClubMoney(address);

        // Convert both to numbers (or keep them as BigInt if you prefer)
        const revEth = Number(ethers.formatEther(revBn));
        const spentEth = Number(ethers.formatEther(spentBn));

        setClubRev(revEth);
        setSpentMoney(spentEth);
      } else {
        setClubRev(0);
        setSpentMoney(0);
      }
    };

    if (address) {
      getContractData();
    }
  }, [provider, signer, address]);

  // Helper to make "club" -> "Club", "player" -> "Player", etc.
  function formatTitleCase(raw) {
    if (!raw) return "";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  // Navigation
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

  // Conditionally render each feature
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
        <p><strong>Address:</strong> {address}</p>
        {/* Display wallet name if any */}
        {walletName && <p className="wallet-name"><strong>Name:</strong> {walletName}</p>}
        {/* e.g. "Club", "Player", "Sponsor" */}
        {walletType && <p className="wallet-type"><strong>Type:</strong> {walletType}</p>}
        <p><strong>Balance in FFP Contract:</strong> {balance} ETH</p>

        {/* If user is a club, also show clubRevenue & spentMoney */}
        {walletType === "Club" && (
          <div className="club-info">
            <p><strong>Club Revenue:</strong> {clubRev} ETH</p>
            <p><strong>Amount Spent:</strong> {spentMoney} ETH</p>
          </div>
        )}
      </div>

      {renderNavigation()}

      <div className="app-content">{renderActiveFeature()}</div>
    </div>
  );
}

export default App;
