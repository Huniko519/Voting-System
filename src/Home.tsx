import { config } from "process";
import React from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Web3 from "web3";
import Abi from "./config/abis/voting.json";
import Config from "./config/config.json";
import "./index.scss";
function Home() {
  const [status, setStatus] = React.useState({
    proposal: "",
    agrees: 0,
    disagrees: 0,
  });
  const [editable, setEditable] = React.useState(false);
  const [address, setAddress] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(cronContract, 5000);
    return () => clearTimeout(timer);
  });

  const call = async (
    to: string,
    abi: any,
    method: string,
    args: Array<string | number | boolean>,
    rpc: string
  ): Promise<any> => {
    const web3 = new Web3(rpc);
    const contract = new web3.eth.Contract(abi, to);
    return await contract.methods[method](...args).call();
  };

  const send = async (
    from: string,
    to: string,
    abi: any,
    value: string,
    method: string,
    args: Array<string | number | boolean>
  ): Promise<string | undefined> => {
    let err = "";
    try {
      const { ethereum } = window;
      // const ethereum = window.ethereum
      if (ethereum && ethereum.isConnected) {
        const web3 = new Web3(ethereum);
        const contract = new web3.eth.Contract(abi, to);
        const data = contract.methods[method](...args).encodeABI();
        const json = { from, to, value, data };
        const res = await ethereum.request({
          method: "eth_sendTransaction",
          params: [json],
        });
        if (res) {
          return res;
        }
        err = "unknown";
      } else {
        err = "ask connect";
      }
    } catch (error: any) {
      if (error.code === 4001) {
        err = "canncelled";
      } else if (error.code === -32603) {
        const matches = error.message.match(/'(\{[^']*\})'/);
        if (matches != null && matches.length === 2) {
          let json: any;
          try {
            json = JSON.parse(matches[1]);
            if (json.value && json.value.data) {
              const { code, message } = json.value.data;
              err = "🦊 " + message + " (" + code + ")";
            } else {
              err = "🦊 " + error.message;
            }
          } catch (err1) {
            err = "🦊 " + error.message;
          }
        } else {
          err = "🦊 " + error.message;
        }
      } else {
        err = "🦊 " + error.message;
      }
    }
    console.log(err);
  };

  const waitTransaction = async (
    txId: string,
    rpc: string
  ): Promise<boolean> => {
    const web3 = new Web3(rpc);
    setLoading(true);
    console.log("start-waiting with txId " + txId);
    let repeat = 100;
    while (--repeat > 0) {
      const receipt = await web3.eth.getTransactionReceipt(txId);
      console.log(receipt);
      if (receipt) {
        const resolvedReceipt = await receipt;
        if (resolvedReceipt && resolvedReceipt.blockNumber) {
          setLoading(false);
          console.log("received txid" + resolvedReceipt.blockNumber);
          return true;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    setLoading(false);
    console.log("waiting timeout");
    return false;
  };

  const cronContract = async () => {
    if (!editable) {
      const proposal = await call(
        Config.voting,
        Abi,
        "proposal",
        [],
        Config.rpc
      );
      const agrees = await call(Config.voting, Abi, "agrees", [], Config.rpc);
      const disagrees = await call(
        Config.voting,
        Abi,
        "disagrees",
        [],
        Config.rpc
      );
      setStatus({ proposal, agrees, disagrees });
    }
  };
  const onUpdateProposal = (e: any) => {
    if (editable) {
      setStatus({ ...status, proposal: e.target.value });
    }
  };
  const onConnect = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts.length) setAddress(accounts[0]);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };
  const onSubmit = async () => {
    if (address === "") {
      onConnect();
    } else {
      const txId = await send(address, Config.voting, Abi, "0x0", "addText", [
        status.proposal.trim(),
      ]);
      waitTransaction(txId === undefined ? "" : txId, Config.rpc);
    }
  };
  const onAgree = () => {
    if (address === "") {
      onConnect();
      send(address, Config.voting, Abi, "0x0", "setAgree", []);
    } else {
      send(address, Config.voting, Abi, "0x0", "setAgree", []);
    }
  };
  const onDisagree = () => {
    if (address === "") {
      onConnect();
    } else {
      send(address, Config.voting, Abi, "0x0", "setDisagree", []);
    }
  };

  return (
    <>
      <section className="container container-xl profile">
        <div
          className="frame mt5 p3"
          style={{ width: "50%", marginLeft: "20%" }}
        >
          <div style={{ textAlign: "right" }}>
            {address === "" ? (
              <button onClick={onConnect}>Connect wallet</button>
            ) : (
              <code style={{ color: "blue" }}>
                {address.slice(0, 12) + "..." + address.slice(-4)}
              </code>
            )}
          </div>
          <h1 style={{ color: "green" }}>Voting Test Site</h1>
          <div>
            <h3>Proposal</h3>
            <div>
              <label>
                <input
                  type="checkbox"
                  onClick={(e: any) => setEditable(e.target.checked)}
                  checked={editable}
                />
                Editable
              </label>
            </div>
            <div>
              <textarea
                className=""
                style={{ width: "100%" }}
                rows={4}
                onChange={onUpdateProposal}
                value={status.proposal}
              />
            </div>
          </div>
          <div className="justify">
            <button
              disabled={!editable}
              className="btn m btn-primary"
              onClick={onSubmit}
            >
              Submit
            </button>
            <div>
              <button
                disabled={editable}
                className="btn m btn-outline-primary"
                onClick={onAgree}
              >
                Agree
              </button>
              <button
                disabled={editable}
                className="btn m btn-outline-danger"
                onClick={onDisagree}
              >
                Disagree
              </button>
              <button disabled={editable} className="btn m btn-outline-info">
                End
              </button>
            </div>
          </div>

          <hr />
          <h4>
            Agree :{" "}
            <span style={{ textDecoration: "underline" }}>
              {" "}
              {status.agrees}
            </span>
          </h4>
          <h4>
            Disagree :{" "}
            <span style={{ textDecoration: "underline" }}>
              {" "}
              {status.disagrees}
            </span>
          </h4>
        </div>
      </section>
      <div className="loader" hidden={!loading}>
        <div className="overlay"></div>
        <div className="loading"></div>
      </div>
    </>
  );
}

export default Home;
