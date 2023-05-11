// "use client";
// import Image from "next/image";
import "core-js/actual";
import "core-js";
import { listen } from "@ledgerhq/logs";
import Btc from "@ledgerhq/hw-app-btc";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { Buffer as buf } from "buffer";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Transaction,
  TransactionInput,
  TransactionOutput,
} from "@ledgerhq/hw-app-btc/lib-es/types";

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

global.Buffer = buf;
window.Buffer = window.Buffer || require("buffer").Buffer;

export default function BITCOIN() {
  const [btc, setbtc] = useState<Btc | null>(null);
  const [btcadd, setbtcaddr] = useState<String | null>(null);
  const [value, setvalue] = useState<String | null>(null);
  useEffect(() => {
    async function fetchData() {}

    fetchData();
  }, []);

  const GetAccountAddress = async () => {
    const transport = await TransportWebHID.create();
    const btc = new Btc({ transport });
    setbtc(btc);
    console.log("SUCESSS", btc);
    if (btc) {
      console.log(btc, "hehe");
      //   toast.loading("brah wait ...");
      let btcadd;
      toast.promise(
        btc
          .getWalletPublicKey("44'/0'/0'/0/0")
          .then((o) => {
            btcadd = o.bitcoinAddress;
            setbtcaddr(o.bitcoinAddress);
            console.log(o.bitcoinAddress);
          })
          .catch((err) => {
            console.error(err);
          }),
        {
          loading: "Loading...",
          success: <b>{btcadd}</b>,
          error: <b>Could not Fetch.</b>,
        }
      );
    }
  };

  const SignMessage = async () => {
    const txInput: TransactionInput = {
      prevout: Buffer.from("PREVOUT_TRANSACTION_HASH", "hex"), // Replace with the transaction hash of the input UTXO
      script: Buffer.from("INPUT_SCRIPT", "hex"), // Replace with the script of the input UTXO
      sequence: Buffer.from("ffffffff", "hex"), // Replace with the sequence number of the input UTXO
    };

    // Define the outputs of the transaction
    const txOutput: TransactionOutput = {
      amount: Buffer.from("OUTPUT_AMOUNT", "hex"), // Replace with the amount to send in satoshis
      script: Buffer.from("OUTPUT_SCRIPT", "hex"), // Replace with the script that defines the recipient address
    };

    // Define the transaction object
    const tx1: Transaction = {
      version: Buffer.from("01000000", "hex"), // Replace with the version of the Bitcoin protocol you want to use
      inputs: [txInput],
      outputs: [txOutput],
    };
    if (value) {
      console.log("Howdy ", value);
      btc
        ?.createPaymentTransaction({
          inputs: [[tx1, 1, null, null]],
          associatedKeysets: ["0'/0/0"],
          additionals: ["0x"],
          outputScriptHex:
            "01905f0100000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac",
        })
        .then((res) => console.log(res));
    } else {
      toast.error("Empty msg");
    }
  };

  return (
    <div>
      <div className=' bg-slate-500 h-screen text-white bold text-3xl'>
        {btcadd == null ? (
          <div
            className='w-screen h-screen flex justify-center items-center text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg  px-5 py-2.5 text-center mr-2 mb-2 cursor-pointer text-4xl'
            onClick={() => GetAccountAddress()}
          >
            GetAccount
          </div>
        ) : (
          <div className='w-screen h-96 flex justify-center items-center'>
            Your Account address {btcadd}
          </div>
        )}
        <div
          className={`w-screen flex justify-center space-x-5 ${
            btcadd == null ? "hidden" : ""
          }`}
        >
          <div>Sign Message</div>
          <div>
            <input
              type='text'
              className='text-black'
              value={(value as string) == null ? "" : (value as string)}
              onChange={(e) => setvalue(e.target.value)}
            />
          </div>
          <button
            className='text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2'
            onClick={() => SignMessage()}
          >
            Sign
          </button>
        </div>
      </div>
      <div>
        <Toaster position='top-left' />
      </div>
    </div>
  );
}
