import { ethers } from "ethers";

export const tokens = (n) => ethers.parseEther(n.toString());
