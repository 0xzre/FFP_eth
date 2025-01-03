import React, { useState } from "react";

function HistoryTxns({ contract }) {
  const [clubAddress, setClubAddress] = useState("");
  const [txHistory, setTxHistory] = useState([]);

  const fetchTxHistory = async () => {
    // Require both contract and an address to search
    if (!contract || !clubAddress) return;

    /********************************************************
     * 1) TransferExecuted events
     ********************************************************/
    // We already have code for this
    // Filter: from=clubAddress, to=anything (null)
    const transferFilter = contract.filters.TransferExecuted(clubAddress, null);
    const transferEvents = await contract.queryFilter(transferFilter, 0, "latest");

    const transferHistory = transferEvents.map((event) => {
      const { from, to, amount, transactionType } = event.args;
      return {
        eventType: "Transfer",            // custom label for display
        from,
        to,
        amount: amount.toString(),
        transactionType,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
      };
    });

    /********************************************************
     * 2) Deposit events
     ********************************************************/
    // event Deposit(address indexed wallet, uint256 amount)
    // So we can filter by the "wallet" param
    const depositFilter = contract.filters.Deposit(clubAddress);
    const depositEvents = await contract.queryFilter(depositFilter, 0, "latest");

    const depositHistory = depositEvents.map((event) => {
      const { wallet, amount } = event.args; 
      return {
        eventType: "Deposit",            // custom label
        from: wallet,                    // deposit has no "to", so replicate wallet as "from"
        to: "N/A",                       // there's no 'to' param in deposit
        amount: amount.toString(),
        transactionType: "deposit",      // or "N/A" if you like
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
      };
    });

    /********************************************************
     * 3) Withdrawal events
     ********************************************************/
    // event Withdrawal(address indexed wallet, uint256 amount)
    // Filter by that address again
    const withdrawalFilter = contract.filters.Withdrawal(clubAddress);
    const withdrawalEvents = await contract.queryFilter(withdrawalFilter, 0, "latest");

    const withdrawalHistory = withdrawalEvents.map((event) => {
      const { wallet, amount } = event.args;
      return {
        eventType: "Withdrawal",         // custom label
        from: wallet,                    // withdrawal has no "to", so replicate wallet as "from"
        to: "N/A",
        amount: amount.toString(),
        transactionType: "withdrawal",   // or "N/A" if you like
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
      };
    });

    /********************************************************
     * 4) Combine & Sort by Block Number
     ********************************************************/
    let combinedHistory = [
      ...transferHistory,
      ...depositHistory,
      ...withdrawalHistory,
    ];

    // Sort ascending by blockNumber (oldest first)
    combinedHistory.sort((a, b) => a.blockNumber - b.blockNumber);

    setTxHistory(combinedHistory);
  };

  return (
    <div className="history-container">
      <h2>History View</h2>
      <div className="history-fetch">
        <input
          type="text"
          value={clubAddress}
          onChange={(e) => setClubAddress(e.target.value)}
          placeholder="Enter address"
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
                <strong>Event Type:</strong> {tx.eventType}
              </p>
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
