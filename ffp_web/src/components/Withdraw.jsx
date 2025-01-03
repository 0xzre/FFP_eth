import React, { useState } from "react";
import { ethers } from "ethers";
import "./Withdraw.css"; // Import the corresponding CSS

function Withdraw({ contract }) {
    const [amount, setAmount] = useState("");
    const [txStatus, setTxStatus] = useState("");

    // Update local state when user types a new amount
    const handleChange = (e) => {
        setAmount(e.target.value);
    };

    // Handle form submission
    const handleWithdraw = async (e) => {
        e.preventDefault();
        setTxStatus("Processing withdrawal...");

        if (!contract) {
            setTxStatus("Contract not loaded. Please check your connection.");
            return;
        }

        try {
            // Convert user input (Ether) to Wei
            const amountWei = ethers.parseEther(amount);

            // Call the 'withdraw(uint256 amount)' function
            const tx = await contract.withdraw(amountWei);
            await tx.wait();

            setTxStatus("Withdrawal successful!");
        } catch (error) {
            console.error("Withdrawal error:", error);
            setTxStatus(error.reason || error.message);
        }
    };

    return (
        <div className="withdraw-container">
            <h2>Withdraw from Your Wallet</h2>
            <form onSubmit={handleWithdraw}>
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

                <button type="submit">Withdraw</button>
            </form>

            {txStatus && <p className="status-message">{txStatus}</p>}
        </div>
    );
}

export default Withdraw;
