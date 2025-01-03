// components/TransferForm.jsx
import React, { useState } from "react";
import { ethers } from "ethers"; // for parseEther
import "./TransferForm.css";

function TransferForm({ contract }) {
  const [formData, setFormData] = useState({
    address: "",
    amount: "",
  });
  const [txStatus, setTxStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTxStatus("Processing transaction...");

    if (!contract) {
      setTxStatus("Contract not loaded. Please check your connection.");
      return;
    }

    try {
      const amountWei = ethers.parseEther(formData.amount);
      console.log("Sending payment to", formData.address, "of", amountWei, "Wei");

      const tx = await contract.transfer(
        formData.address,
        amountWei,
        "playerPurchase" // example
      );
      await tx.wait();

      setTxStatus("Transaction successful!");
    } catch (err) {
      console.error("Error while sending payment:", err);
      setTxStatus(`Transaction failed: ${err.reason ?? err.message}`);
    }
  };

  return (
    <div className="transfer-form-container">
      <h2 className="transfer-form-title">Send Payment</h2>
      <form onSubmit={handleSubmit} className="transfer-form">
        <label className="transfer-form-label">
          Address:
          <input
            className="transfer-form-input"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="0x..."
            required
          />
        </label>

        <label className="transfer-form-label">
          Transfer Amount (ETH):
          <input
            className="transfer-form-input"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.1"
            required
          />
        </label>

        <button className="transfer-form-button" type="submit">
          Submit
        </button>
      </form>

      {txStatus && <p className="transfer-form-status-message">{txStatus}</p>}
    </div>
  );
}

export default TransferForm;
