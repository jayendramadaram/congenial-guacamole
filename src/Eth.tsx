// "use client";
// import Image from "next/image";
import "core-js/actual";
import "core-js";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { Buffer as buf } from "buffer";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Eth from "@ledgerhq/hw-app-eth";
import { ledgerService } from "@ledgerhq/hw-app-eth";
import { encode } from "rlp";

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

global.Buffer = buf;
window.Buffer = window.Buffer || require("buffer").Buffer;

interface FormState {
  nonce: string;
  gasPrice: string;
  gasLimit: string;
  to: string;
  value: string;
  data: string;
}

const DEFAULT_FORM_STATE: FormState = {
  nonce: "",
  gasPrice: "",
  gasLimit: "",
  to: "",
  value: "",
  data: "",
};

interface Signature {
  r: string;
  s: string;
  v: string;
}

export default function ETHEREUM() {
  const [eth, seteth] = useState<Eth | null>(null);
  const [ethadd, setethaddr] = useState<String | null>(null);
  const [value, setvalue] = useState<String | null>(null);
  const [msgSig, setmsgSig] = useState<String | null>(null);
  const [txSignature, settxSignature] = useState<Signature | null>(null);

  const GetAccountAddress = async () => {
    const transport = await TransportWebHID.create();
    const eth = new Eth(transport);
    seteth(eth);
    console.log("yep");

    if (eth) {
      console.log(eth, "hehe");
      //   toast.loading("brah wait ...");
      let ethadd;
      toast.promise(
        eth
          .getAddress("44'/60'/0'/0/0")
          .then((o) => {
            ethadd = o.address;
            setethaddr(o.address);
            console.log(o.address);
          })
          .catch((err) => {
            console.error(err);
          }),
        {
          loading: "Loading...",
          success: <b>{ethadd}</b>,
          error: <b>Could not Fetch.</b>,
        }
      );
    }
  };

  const SignMessage = async () => {
    if (value) {
      console.log("Howdy ", value);
      toast.promise(
        eth
          ?.signPersonalMessage(
            "44'/60'/0'/0/0",
            Buffer.from(value as string).toString("hex")
          )
          .then((result) => {
            let _V;
            let v = result["v"] - 27;
            let V = v.toString(16);
            if (V.length < 2) {
              _V = "0" + v;
            }
            setmsgSig("0x" + result["r"] + result["s"] + _V);
            console.log("Signature 0x" + result["r"] + result["s"] + _V);
          }) as Promise<void>,
        {
          loading: "Loading...",
          success: <b>Msg Signed</b>,
          error: <b>Could not Fetch.</b>,
        }
      );
    } else {
      toast.error("Empty msg");
    }
  };

  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // console.log({ ...formState, [name]: value });

    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const transaction = {
      nonce: `0x${formState.nonce}`,
      gasPrice: `0x${formState.gasPrice}`,
      gasLimit: `0x${formState.gasLimit}`,
      to: formState.to,
      value: `0x${formState.value}`,
      data: formState.data,
    };

    const rawTransaction = encode([
      transaction.nonce,
      transaction.gasPrice,
      transaction.gasLimit,
      transaction.to,
      transaction.value,
      transaction.data,
    ]);
    // rawTransaction.toString('
    console.log(rawTransaction);

    const tx = Buffer.from(rawTransaction).toString("hex");
    console.log(transaction);
    const resolution = await ledgerService.resolveTransaction(tx, {}, {});
    const result = await eth?.signTransaction("44'/60'/0'/0/0", tx, resolution);
    console.log(result);
    settxSignature(result as Signature);

    setFormState(DEFAULT_FORM_STATE);
  };

  return (
    <div>
      <div className=' bg-slate-500 overflow-hidden text-white bold text-3xl'>
        {ethadd == null ? (
          <div
            className='w-screen h-screen flex justify-center items-center text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg  px-5 py-2.5 text-center mr-2 mb-2 cursor-pointer text-4xl'
            onClick={() => GetAccountAddress()}
          >
            GetAccount
          </div>
        ) : (
          <div className='w-screen h-96 flex justify-center items-center'>
            Your Account address {ethadd}
          </div>
        )}
        <div
          className={`w-screen flex justify-center space-x-5 ${
            ethadd == null ? "hidden" : ""
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
        <div
          className={`${
            ethadd == null ? "hidden" : ""
          }w-screen break-words px-10`}
        >
          Your Signature : {msgSig}
        </div>

        <form
          className={`w-5/6 mx-auto my-20 ${ethadd == null ? "hidden" : ""}`}
          onSubmit={handleSubmit}
        >
          <div className='relative z-0 w-full mb-6 group'>
            <input
              name='data'
              id='data'
              className='block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer'
              placeholder=' '
              required
              onChange={(e) => handleInputChange(e)}
            />
            <label className='peer-focus:font-medium absolute text-lg text-white dark:text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>
              Enter Your Call Data
            </label>
          </div>
          <div className='relative z-0 w-full mb-6 group'>
            <input
              name='to'
              id='to'
              className='block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer'
              placeholder=' '
              required
              onChange={(e) => handleInputChange(e)}
            />
            <label className='peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>
              To Address
            </label>
          </div>
          <div className='grid md:grid-cols-2 md:gap-6'>
            <div className='relative z-0 w-full mb-6 group'>
              <input
                name='nonce'
                id='nonce'
                className='block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                placeholder=' '
                required
                onChange={(e) => handleInputChange(e)}
              />
              <label className='peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>
                nonce For the transaction
              </label>
            </div>
            <div className='relative z-0 w-full mb-6 group'>
              <input
                type='text'
                name='gasPrice'
                id='gasPrice'
                className='block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                placeholder=' '
                required
                onChange={(e) => handleInputChange(e)}
              />
              <label className='peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>
                Gas Price For your transaction
              </label>
            </div>
          </div>
          <div className='grid md:grid-cols-2 md:gap-6'>
            <div className='relative z-0 w-full mb-6 group'>
              <input
                type='tel'
                name='gasLimit'
                id='gasLimit'
                className='block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                placeholder=' '
                required
                onChange={(e) => handleInputChange(e)}
              />
              <label className='peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>
                gasLimit for tx
              </label>
            </div>
            <div className='relative z-0 w-full mb-6 group'>
              <input
                type='number'
                name='value'
                id='value'
                className='block py-2.5 px-0 w-full text-lg text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                placeholder=' '
                required
                onChange={(e) => handleInputChange(e)}
              />
              <label className='peer-focus:font-medium absolute text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>
                amount of ether to send
              </label>
            </div>
          </div>
          <button
            type='submit'
            className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
          >
            Sign
          </button>
          <div className={` ${txSignature == null ? "hidden" : ""} `}>
            <div>Your Signed Transaction</div> <div>v : {txSignature?.v}</div>{" "}
            <div>s : {txSignature?.s}</div> <div>r : {txSignature?.r}</div>
          </div>
        </form>
      </div>
      <div>
        <Toaster position='top-left' />
      </div>
    </div>
  );
}
