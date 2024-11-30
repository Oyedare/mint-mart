import { ethers } from "ethers";

export const tokens = (n) => ethers.parseEther(n.toString());

export const toEth = (wei) => {
    try {
      return ethers.formatEther(wei.toString());
    } catch (error) {
      console.error("Conversion error:", error);
      return "0";
    }
};
