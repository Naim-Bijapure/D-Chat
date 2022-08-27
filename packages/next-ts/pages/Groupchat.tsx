import type { NextPage } from "next";
import { LSPFactory } from "@lukso/lsp-factory.js";
import { useEffect, useState } from "react";
import { useAccount, useBalance, useSigner, useProvider, useNetwork } from "wagmi"
import ERC725 from "@erc725/erc725.js";
import LSP10ReceivedVaults from "@erc725/erc725.js/schemas/LSP10ReceivedVaults.json";
import account from "../contracts/account.json";
import LSP3 from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json";
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import LSP9Vault from "@erc725/erc725.js/schemas/LSP9Vault.json";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import Web3 from "web3";

import ChatView from "../components/Chat/ChatView";
import useLocalStorage from "../hooks/useLocalStorage";


  const provider = useProvider();
  const { chain: activeChain } = useNetwork();

  const RPC_ENDPOINT: string = activeChain?.rpcUrls ? activeChain?.rpcUrls.default : "";
  const CHAIN_ID: number = activeChain?.id ? activeChain?.id : 0;

  const lspFactory = new LSPFactory(RPC_ENDPOINT, {
    deployKey: account.privateKey,
    chainId: CHAIN_ID,
  });
  




const GroupChat: NextPage = () => {
 
  const [ownedUP, setOwnedUP] = useState();
  const [UPName, setUPName] = useState("");
  const [UPDescribe, setUPDescribe] = useState("");
  const [UPTags, setUPTags] = useState([]);
  const [tokenName, setTokenName] = useState("");
  const [ set] = useState([]);
  
  const links = {title:"", url:"",};


  const groupChatUP: () => any = async (): Promise<any> => {
    console.log("onCreateUP: started ");

    const commonSigner = new ethers.Wallet(account.privateKey, provider); // <---- custom signer from EOA account

  
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return deployedContracts;
    }
    const output = await createUniversalProfile();
    // console.log("output: ", output);

    const upAddress = output["LSP0ERC725Account"]["address"] as string;

    console.log("UP Address : "+ " " + upAddress)

    setOwnedUP(upAddress);
  
  };

  return (
    <>
      <main className="flex items-start justify-around h-[100%] ">
        {/* on active chat */}

        {/* <button className="btn btn-primary" onClick={onTest}>
          Test
        </button> */}
        
          <div className="self-center w-[50%]">
            <button className="btn btn-primary" onClick={groupChatUP}>
              New Group Chat
            </button>
          </div>
        // use chat view component

        {/* {chatMetaData && chatMetaData["activeChat"] === true && (
          <div className="w-[100%]">
            <ChatView onDeleteChat={onDeleteChat} chatMetaData={chatMetaData} setChatMetaData={setChatMetaData} />
          </div>
        )} */}


        {/* extra side info */}
        {/* <div className="w-[10%]">extra info display view if needed</div> */}
      </main>
    </>
  );
};

export default GroupChat;