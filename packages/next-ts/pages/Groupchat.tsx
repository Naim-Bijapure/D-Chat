/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import ERC725 from "@erc725/erc725.js";
import LSP3 from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json";
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import { LSPFactory } from "@lukso/lsp-factory.js";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useState } from "react";
import { useAccount, useBalance, useProvider, useNetwork } from "wagmi"
import Web3 from "web3";

import ChatView from "../components/Chat/ChatView";
import account from "../contracts/account.json";
import useLocalStorage from "../hooks/useLocalStorage";


const RPC_URL = "http://0.0.0.0:8545";



const GroupChat: NextPage = () => {
  const { address } = useAccount();
  
  
  const Provider = useProvider();
  const { chain: activeChain } = useNetwork();
  const RPC_ENDPOINT: string = activeChain?.rpcUrls ? activeChain?.rpcUrls.default : "";
  const CHAIN_ID: number = activeChain?.id ? activeChain?.id : 0;
  const lspFactory = new LSPFactory(RPC_ENDPOINT, {
    deployKey: account.privateKey,
    chainId: CHAIN_ID,
  });
  
  const [ownedUP, setOwnedUP] = useState<string>("");
  const [UPName, setUPName] = useState<string>("");
  const [UPDescribe, setUPDescribe] = useState("");
  const [UPTags, setUPTags] = useState<any>([]);
  const [tokenName, setTokenName] = useState<string>("");
  const [chatMetaData, setChatMetaData] = useLocalStorage("chatMetaData", {
    activeChat: false,
    chatUsers: [],
    UP_ADDRESS: "",
    DYNAMIC_KEY: "",
  });
  
  const links = {title:"", url:"",};

  let userAdd = "";
  let chatUsers: any[] = []
  
  /** -------------------------
   *  grant creator permissions
   * -------------------------*/
  
  const web3provider = new Web3.providers.HttpProvider(RPC_URL);
  const provider = new ethers.providers.StaticJsonRpcProvider(RPC_URL);
  const walletSigner = new ethers.Wallet(account.privateKey, provider); // <---- custom signer from EOA account
  
  let UP: ethers.Contract, KM: ethers.Contract, erc725: ERC725;
  
  const myString = {
    name: "String",
    key: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("String")),
    keyType: "Singleton",
    valueType: "string",
    valueContent: "String",
  };
  
  const myStringArr = {
    name: "String[]",
    key: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("String[]")),
    keyType: "Array",
    valueType: "string",
    valueContent: "String",
  };
  
  LSP3.push(myString);
  LSP3.push(myStringArr);
  
  async function LoadContracts(): Promise<void> {
    // load UP contract
    UP = new ethers.Contract(ownedUP, UniversalProfile.abi, walletSigner); // <---- create UP contract instance from address
    const upOwner = await UP?.owner(); // <---- get owner of UP contract
    console.log("UP: ", UP.address);
  
    // load KM contract
    KM = new ethers.Contract(upOwner as string, KeyManager.abi, walletSigner); // <---- get key manager from UP contract
    console.log("KM:address ", KM.address);
  
    erc725 = new ERC725(
      // @ts-ignore
      [...LSP3, ...LSP6Schema,],
      ownedUP,
      web3provider
    );
  }
  
  async function grantPersmission(): Promise<boolean> {
    try {
      /** ---------------------------------------
       * set all permission for the group creator
       * ---------------------------------------*/
      const beneficiaryAddress = address; // EOA address of an exemplary person
      const beneficiaryPermissions = erc725?.encodePermissions({
        ADDPERMISSIONS: true,
        CALL: true,
        CHANGEOWNER: true,
        CHANGEPERMISSIONS: true,
        DELEGATECALL: true,
        DEPLOY: true,
        SETDATA: true,
        SIGN: true,
        STATICCALL: true,
        SUPER_CALL: true,
        SUPER_DELEGATECALL: true,
        SUPER_SETDATA: true,
        SUPER_STATICCALL: true,
        SUPER_TRANSFERVALUE: true,
        TRANSFERVALUE: true,
      });
  
      /** -----------------------------------------------------------
       * encode the data key-value pairs of the permissions to be set
       * -----------------------------------------------------------*/
      
      const data = erc725?.encodeData({
        // @ts-ignore
        keyName: "AddressPermissions:Permissions:<address>",
        dynamicKeyParts: beneficiaryAddress,
        value: beneficiaryPermissions,
      });
  
      // console.log("data: ", data);
  
      const payload = UP.interface.encodeFunctionData("setData(bytes32,bytes)", [data.keys[0], data.values[0]]);
  
      // send the transaction via the Key Manager contract
      const tx = await KM.connect(walletSigner).execute(payload, { gasLimit: 10000000 }); // <---- call the execute on key manager contract
      const rcpt = await tx.wait();
      console.log(rcpt);
  
  
      return true;
    } catch (error) {
      console.log("error: ", error);
      return false;
    }
  };


  /** -----------------------------------
   * set the group chat users permission
   * -----------------------------------*/

  async function grantUserPersmission(): Promise<boolean> {
    try {
      /** ----------------------
       * set the call permission
       * ---------------------*/
      const beneficiaryAddress = userAdd; // EOA address of groupchat user
      const beneficiaryPermissions = erc725?.encodePermissions({
        // ADDPERMISSIONS: true,
        CALL: true,
        // CHANGEOWNER: true,
        // CHANGEPERMISSIONS: true,
        // DELEGATECALL: true,
        // DEPLOY: true,
        // SETDATA: true,
        // SIGN: true,
        // STATICCALL: true,
        // SUPER_CALL: true,
        // SUPER_DELEGATECALL: true,
        // SUPER_SETDATA: true,
        // SUPER_STATICCALL: true,
        // SUPER_TRANSFERVALUE: true,
        // TRANSFERVALUE: true,
      });
  
      /** -----------------------------------------------------------
       * encode the data key-value pairs of the permissions to be set
       * -----------------------------------------------------------*/
      
      const data = erc725?.encodeData({
        // @ts-ignore
        keyName: "AddressPermissions:Permissions:<address>",
        dynamicKeyParts: beneficiaryAddress,
        value: beneficiaryPermissions,
      });
  
      // console.log("data: ", data);
  
      const payload = UP.interface.encodeFunctionData("setData(bytes32,bytes)", [data.keys[0], data.values[0]]);
  
      // send the transaction via the Key Manager contract
      const tx = await KM.connect(walletSigner).execute(payload, { gasLimit: 10000000 }); // <---- call the execute on key manager contract
      const rcpt = await tx.wait();
      console.log(rcpt);

      chatUsers.push(userAdd.toString);
  
      
      return true;
    } catch (error) {
      console.log("error: ", error);
      return false;
    }
  };
  
  
  /** --------------------------------------------------
   * create and deploy the group chat Universal Profile
   * --------------------------------------------------*/
  
  const groupChatUP: () => any = async (): Promise<any> => {
    console.log("onCreateUP: started ");

  
    async function createUniversalProfile(): Promise<any> {
      const deployedContracts = await lspFactory.UniversalProfile.deploy({
        controllerAddresses: [account.address], // our EOA that will be controlling the UP
        lsp3Profile: {
          name: UPName,
          description: UPDescribe,
          tags: UPTags,
          links: [
            links,
          ],
        },
        // @ts-ignore
        LSP4TokenName: tokenName,
      });
      console.log("Group UP created");
       
      return deployedContracts;
    }
    const output = await createUniversalProfile();
     console.log("output: ", output);

    const upAddress = output["LSP0ERC725Account"]["address"] as string;

    console.log("UP Address : "+ " " + upAddress)
    
    setOwnedUP(upAddress);

    await LoadContracts();
    const givePermissions = await grantPersmission();

    console.log("Give Permissions:", givePermissions);
    
  };

  const onStartChat: () => any = async (): Promise<any> => {

    const KEY_NAME = "chat:<string>:<string>";

    chatUsers = [...chatUsers, address?.toString].sort();

    const dynamicKey: string = ERC725.encodeKeyName(KEY_NAME, [...chatUsers]);

    const DYNAMIC_KEY = dynamicKey;

    await setChatMetaData({
      ...chatMetaData,
      chatUsers: [...chatUsers],
      activeChat: true,
      UP_ADDRESS: ownedUP,
      DYNAMIC_KEY,
    });

};
// ts-ignore
if (chatUsers.includes(address?.toString)){
  onStartChat();
};

const onDeleteChat: () => any = async (): Promise<any> => {
  await setChatMetaData({
    activeChat: false,
  });
  // window.location.reload();
};

  return (
    <>
      <main className="flex items-start justify-around h-[100%] ">
        {/* on active chat */}

        {/* <button className="btn btn-primary" onClick={onTest}>
          Test
        </button> */}

        {chatMetaData && chatMetaData["activeChat"] === false && (
          <div className="self-center w-[50%]">
            <form>
              <div className="mb-6">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Name</label>
                <input type="name" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buidlers" onChange={(e): any => setUPName(e.target.value)} required></input>
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Description</label>
                <input type="text" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="We are dedicated to buidling the future of the web" onChange={(e): any => setUPDescribe(e.target.value)} required></input>
              </div>
              <div className="mb-6">
                <label htmlFor="tags" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Tags</label>
                <input type="text" id="email" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="web3 lukso buidl hackathon" onChange={(e): void => setUPTags(e.target.value)} required></input>
              </div>
              <div className="mb-6">
                <label htmlFor="link" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Link Title</label>
                <input type="link" id="email" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Our website" onChange={(e): any => links.title = e.target.value} required></input>
              </div>
              <div className="mb-6">
                <label htmlFor="link" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Link</label>
                <input type="email" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="https://buidlguidl.com" onChange={(e): any => links.url = e.target.value} required></input>
              </div>
              <div className="mb-6">
                <label htmlFor="text" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Token Name (optional)</label>
                <input type="text" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="GOLD" onChange={(e): any => setTokenName(e.target.value)}></input>
              </div>
              

              <button type="submit" className="w-full px-5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 sm:w-auto py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={groupChatUP}>Create Group</button>
            </form>
          </div>
        )}
        
        {chatMetaData && chatMetaData["activeChat"] === true && (
          <div className="w-[100%]">
            <div className="mb-6">
                <label htmlFor="text" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Member address</label>
                <input type="text" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="0x" onChange={(e): string => userAdd = e.target.value}></input>
                
                <button type="submit" className="w-full px-5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 sm:w-auto py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={async (): Promise<boolean> => grantUserPersmission() }>Add Member</button>
              </div>
            <div>
            <ChatView onDeleteChat={onDeleteChat} chatMetaData={chatMetaData} setChatMetaData={setChatMetaData} />
            </div>
          </div>
        )}


        {/* extra side info */}
        {/* <div className="w-[10%]">extra info display view if needed</div> */}
      </main>
    </>
  );
};

export default GroupChat;