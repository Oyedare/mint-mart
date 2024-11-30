import { useState } from "react";
import NFTCreateForm from "./NftCreateForm";

/* eslint-disable react/prop-types */
const Navigation = ({ account, setAccount }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const connectHandler = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];
    setAccount(account);
  };

  const disconnect = () => {
    setAccount(null);
  };

  const openForm = () => {
    setIsFormOpen(true);
  };
  return (
    <nav>
      <div className="nav__brand">
        <h1>
          <a href="/">Mint Mart</a>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="bg-black text-white font-bold py-2 px-4 rounded"
          onClick={openForm}
        >
          Create
        </button>

        {account ? (
          <button type="button" className="nav__connect" onClick={disconnect}>
            {account.slice(0, 6) + "..." + account.slice(38, 42)}
          </button>
        ) : (
          <button
            type="button"
            className="nav__connect"
            onClick={connectHandler}
          >
            Connect
          </button>
        )}
      </div>

      {isFormOpen && <NFTCreateForm setIsFormOpen={setIsFormOpen} />}
    </nav>
  );
};

export default Navigation;
