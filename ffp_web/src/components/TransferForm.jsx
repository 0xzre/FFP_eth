import React, { useState } from "react";
import { ethers } from "ethers";
import "./TransferForm.css";

function TransferForm({ contract }) {
  // Keep everything in a single formData object: address, amount, transactionType
  const [formData, setFormData] = useState({
    address: "",
    amount: "",
    transactionType: "playerSalary", // default selection
  });

  const [txStatus, setTxStatus] = useState("");

  // Handle changes for both text inputs and radio buttons
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTxStatus("Processing transaction...");

    if (!contract) {
      setTxStatus("Contract not loaded. Please check your connection.");
      return;
    }

    try {
      // Convert the string "amount" to BigNumber in Wei
      const amountWei = ethers.parseEther(formData.amount);

      console.log(
        "Sending payment to",
        formData.address,
        "of",
        amountWei,
        "Wei with type:",
        formData.transactionType
      );

      // Use the transactionType from formData
      const tx = await contract.transfer(
        formData.address,
        amountWei,
        formData.transactionType
      );

      await tx.wait(); // Wait for block confirmation
      setTxStatus("Transaction successful!");
    } catch (error) {
      console.error("Error while sending payment:", error);
      setTxStatus(`Transaction failed: ${error.reason ?? error.message}`);
    }
  };

  return (
    <div className="transfer-form-container">
      <h2 className="transfer-form-title">Send Payment</h2>
      <form onSubmit={handleSubmit} className="transfer-form">
        <label className="transfer-form-label">Address:</label>
        <input
          className="transfer-form-input"
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="0x..."
          required
        />

        <label className="transfer-form-label">Transfer Amount (ETH):</label>
        <input
          className="transfer-form-input"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.1"
          required
        />

        {/* Radio Buttons for Transaction Type */}
        <div className="transaction-type">
          <p>Select Transaction Type:</p>

          <label>
            <input
              type="radio"
              name="transactionType"
              value="playerSalary"
              checked={formData.transactionType === "playerSalary"}
              onChange={handleChange}
            />
            Player Salary
          </label>

          <label>
            <input
              type="radio"
              name="transactionType"
              value="playerPurchase"
              checked={formData.transactionType === "playerPurchase"}
              onChange={handleChange}
            />
            Player Purchase
          </label>

          <label>
            <input
              type="radio"
              name="transactionType"
              value="sponsorship"
              checked={formData.transactionType === "sponsorship"}
              onChange={handleChange}
            />
            Sponsorship
          </label>
        </div>

        <button className="transfer-form-button" type="submit">
          Submit
        </button>
      </form>

      {txStatus && <p className="transfer-form-status-message">{txStatus}</p>}
    </div>
  );
}

export default TransferForm;
