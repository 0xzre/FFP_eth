import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ABI, SCAddress } from "./Env";
import TransferForm from "./components/TransferForm";

import "./App.css";

function App() {
  // const [provider, setProvider] = useState(null);
  // const [network, setNetwork] = useState("");
  // const [address, setAddress] = useState("");
  // const [contract, setContract] = useState(null);
  // const [signer, setSigner] = useState(null);
  // const [errorTx, setErrorTx] = useState("");

  // useEffect(() => {
  //   const initializeProvider = async () => {
  //     if (window.ethereum) {
  //       await window.ethereum.request({ method: "eth_requestAccounts" });
  //       const provider = new ethers.BrowserProvider(window.ethereum);
  //       setProvider(provider);
  //       const signer = await provider.getSigner();
  //       setSigner(signer);
  //       setAddress(signer.getAddress());
  //     }
  //   };
  //   initializeProvider();
  // }, []);

  // useEffect(() => {
  //   if (provider) {
  //     provider.getNetwork().then((network) => {
  //       setNetwork(network.name);
  //     });
  //   }
  // }, [provider]);

  // useEffect(() => {
  //   const getContract = async () => {
  //     if (provider) {
  //       const contract = new ethers.Contract(SCAddress, ABI, signer);
  //       setContract(contract);
  //     }
  //   };
  //   getContract();
  // }, [provider, signer]);

  // const interactWithContract = async () => {
  //   if (contract) {
  //     try {
  //       // Replace with actual wallet and type
  //       // const tx = await contract.registerWallet(address, "club");
  //       console.log('entered interact')
  //       const tx = contract.registerWallet(address, "club");
  //       const gas = await signer.estimateGas(tx);
  //       console.log('gas:', gas);
  //       console.log("Transaction sent:", tx.hash);

  //       // Wait for the transaction to be mined
  //       const receipt = await tx.wait();
  //       console.log("Transaction mined:", receipt);
  //     } catch (error) {
  //       setErrorTx(error.message);
  //     }
  //   }
  // };

  return (
    <div className="app-container">
      <h1 className="app-title">Financial Fairplay</h1>
      <TransferForm />
    </div>
  );
}

export default App;
