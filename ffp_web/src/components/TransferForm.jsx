import React, { useState } from 'react';
import './TransferForm.css'; // Import the CSS file for styling

function TransferForm() {
  // For demonstration, placeholder login data.
  const [loginStatus, setLoginStatus] = useState({
    user: 'MyClubFC',    // or 'Agent007'
    ethBalance: 10.5,    // example ETH balance
  });

  // Form data for address & transfer amount
  const [formData, setFormData] = useState({
    address: '',
    amount: '',
  });

  // Handle changes to address or amount fields
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Form submitted with data:', formData);

    // Example pseudo-code for blockchain interaction:
    // try {
    //   const tx = await contract.sendPayment(formData.address, formData.amount);
    //   await tx.wait();
    //   alert('Payment sent successfully!');
    // } catch (error) {
    //   console.error('Error while sending payment:', error);
    //   alert('Transaction failed!');
    // }
  };

  // Create a status string to display
  const statusString = `${loginStatus.user} | ${loginStatus.ethBalance} ETH`;

  return (
    <div className="transfer-form-container">
      <h2 className="transfer-form-title">Send Payment</h2>
      <form onSubmit={handleSubmit} className="transfer-form">
        
        {/* Display login status as plain text instead of input */}
        <label htmlFor="login-status" className="transfer-form-label">
          Logged in as:
        </label>
        <div id="login-status" className="transfer-form-status">
          {statusString}
        </div>

        <label htmlFor="address" className="transfer-form-label">
          Address:
        </label>
        <input
          className="transfer-form-input"
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <label htmlFor="amount" className="transfer-form-label">
          Transfer Amount:
        </label>
        <input
          className="transfer-form-input"
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />

        <button className="transfer-form-button" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}

export default TransferForm;
