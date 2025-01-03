import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ABI, SCAddress } from "./Env";

function App() {
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState("");
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [errorTx, setErrorTx] = useState("");

  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const signer = await provider.getSigner();
        setSigner(signer);
        setAddress(signer.getAddress());
      }
    };
    initializeProvider();
  }, []);

  useEffect(() => {
    if (provider) {
      provider.getNetwork().then((network) => {
        setNetwork(network.name);
      });
    }
  }, [provider]);

  useEffect(() => {
    const getContract = async () => {
      if (provider) {
        const contract = new ethers.Contract(SCAddress, ABI, signer);
        setContract(contract);
      }
    };
    getContract();
  }, [provider, signer]);

  const interactWithContract = async () => {
    if (contract) {
      try {
        const sign = await provider.getSigner();
        const addr = await sign.getAddress();
        console.log('addr', addr);
        // const tx = await contract.registerWallet(addr, "club");
        const tx = await contract.wallets(addr);
        console.log("Transaction sent:", tx.hash);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction mined:", receipt);
      } catch (error) {
        setErrorTx(error.message);
      }
    }
  };

  return (
    <div>
      <h1>FFP Rule Ethereum</h1>
      <p>Connected Account: {address}</p>
      <p>Connected to network: {network}</p>
      <p>{errorTx}</p>
      <button onClick={interactWithContract}>Interact with Contract</button>
    </div>
  );
}

export default App;
