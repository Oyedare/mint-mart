import { ethers } from "ethers";

export const getSigner = async () => {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        throw new Error("MetaMask not installed");
    }

    let accounts;
    try {
        accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
        console.error("Failed to connect accounts", error);
        throw error;
    }

    if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(accounts[0]);

    return signer;
}