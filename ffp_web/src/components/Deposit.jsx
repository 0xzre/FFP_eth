import React, { useState } from "react";
import { ethers } from "ethers";
import "./Deposit.css"; // Your deposit CSS styling

function Deposit({ contract }) {
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setTxStatus("Processing deposit...");

    if (!contract) {
      setTxStatus("Contract not loaded. Please check your connection.");
      return;
    }

    try {
      // Convert ETH amount string to Wei
      const amountWei = ethers.parseEther(amount);

      // Call the contract's deposit() function, which applies only to msg.sender
      const tx = await contract.deposit({
        value: amountWei,
      });

      await tx.wait();
      setTxStatus("Deposit successful!");
    } catch (error) {
      console.error("Deposit error:", error);
      setTxStatus(error.reason || error.message);
    }
  };

  return (
    <div className="deposit-container">
      <h2>Deposit to Your Wallet</h2>
      <form onSubmit={handleDeposit}>
        <label>
          Amount (ETH):
          <input
            type="number"
            value={amount}
            onChange={handleChange}
            placeholder="0.1"
            required
          />
        </label>
        <br />

        <button type="submit">Deposit</button>
      </form>

      {txStatus && <p className="status-message">{txStatus}</p>}
    </div>
  );
}

export default Deposit;
