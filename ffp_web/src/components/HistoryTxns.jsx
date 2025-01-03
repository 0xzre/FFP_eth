// components/HistoryTxns.jsx
import React, { useState } from "react";

function HistoryTxns({ contract }) {
  const [clubAddress, setClubAddress] = useState("");
  const [txHistory, setTxHistory] = useState([]);

  const fetchTxHistory = async () => {
    if (!contract || !clubAddress) return;

    const filter = contract.filters.TransferExecuted(clubAddress, null);
    const events = await contract.queryFilter(filter, 0, "latest");

    const history = events.map((event) => {
      const { from, to, amount, transactionType } = event.args;
      return {
        from,
        to,
        amount: amount.toString(),
        transactionType,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
      };
    });

    setTxHistory(history);
  };

  return (
    <div className="history-container">
      <h2>History View</h2>
      <div className="history-fetch">
        <input
          type="text"
          value={clubAddress}
          onChange={(e) => setClubAddress(e.target.value)}
          placeholder="Enter Club Address"
        />
        <button onClick={fetchTxHistory}>Fetch Transactions</button>
      </div>

      {txHistory.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="history-list">
          {txHistory.map((tx, idx) => (
            <div key={idx} className="history-item">
              <p>
                <strong>From:</strong> {tx.from}
              </p>
              <p>
                <strong>To:</strong> {tx.to}
              </p>
              <p>
                <strong>Amount:</strong> {tx.amount}
              </p>
              <p>
                <strong>Transaction Type:</strong> {tx.transactionType}
              </p>
              <p>
                <strong>Block Number:</strong> {tx.blockNumber}
              </p>
              <p>
                <strong>Tx Hash:</strong> {tx.txHash}
              </p>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryTxns;
