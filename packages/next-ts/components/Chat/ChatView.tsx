/* eslint-disable @typescript-eslint/no-unsafe-return */
import ERC725 from "@erc725/erc725.js";
import LSP10ReceivedVaults from "@erc725/erc725.js/schemas/LSP10ReceivedVaults.json";
import erc725schema from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json";
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import LSP9Vault from "@erc725/erc725.js/schemas/LSP9Vault.json";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import axios from "axios";
import { ContractInterface, ethers, Signer } from "ethers";
import type { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
// import { GrSend } from "react-icons/gr";
import { RiDeleteBinLine } from "react-icons/ri";
import { TbSend } from "react-icons/tb";
import { FallingLines, RotatingSquare, ThreeDots } from "react-loader-spinner";
import { useAccount, useNetwork, useProvider, useSigner } from "wagmi";
import { BASE_URL } from "../../constants";

import { Vault, Vault__factory } from "../../contracts/contract-types";
import { connectUserReponseType } from "../../types";
import { Sleep } from "../configs/utils";
import Blockie from "../EthComponents/Blockie";

const KEY_NAME = "chat:<string>:<string>";

const IPFS_GATEWAY = "https://2eff.lukso.dev/ipfs/";

const config = { ipfsGateway: IPFS_GATEWAY };

const chatSchema = {
  name: "chat:<string>:<string>",
  key: "0x",
  keyType: "Mapping",
  valueType: "string[]",
  valueContent: "String",
};

erc725schema.push(chatSchema);

interface IChatView {
  chatMetaData: any;
  interests: string[];
  isTyping: boolean;
  isMsgComing: boolean;
  // onDeleteChat: () => any;
  setChatMetaData: (arg: any) => any;
  // onEndChat: (arg: any) => any;
  onStartChat: (arg: any) => any;
  onStopChat: (arg: any) => any;
  onTypingAlert: (arg: any) => any;
  onMsgIncomingAlert: (arg: any) => any;
}

const ChatView: NextPage<IChatView> = ({
  chatMetaData,
  isTyping,
  interests,
  isMsgComing,
  // onDeleteChat,
  setChatMetaData,
  // onEndChat,
  onStartChat,
  onStopChat,
  onTypingAlert,
  onMsgIncomingAlert,
}) => {
  // const [chatMetaData, setChatMetaData] = useLocalStorage("chatMetaData", {
  //   activeChat: false,
  //   chatUsers: [],
  //   UP_ADDRESS: "",
  //   VAULT_ADDRESS: "",
  // });

  // l-wagmi hooks
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const provider = useProvider();

  // l-states
  const [erc725, setErc725] = useState<ERC725>();
  const [up, setUp] = useState<ethers.Contract>();
  const [vault, setVault] = useState<Vault | any>();
  const [km, setKm] = useState<ethers.Contract>();
  const [chatMessage, setChatMessage] = useState<string>("");
  const [dynamicKey, setDynamicKey] = useState<string>("");
  const [messagesData, setMessagesData] = useState<any[]>([]);
  const [isFinding, setIsFinding] = useState<boolean>(false);
  const [isMsgSending, setIsMsgSending] = useState<boolean>(false);

  const messagesCount = useRef<number>(0);

  // l-mehtods
  const loadContracts: () => any = async () => {
    const { UP_ADDRESS, VAULT_ADDRESS, DYNAMIC_KEY } = chatMetaData;
    const erc725 = new ERC725(
      // @ts-ignore
      [...erc725schema, ...LSP6Schema, ...LSP10ReceivedVaults, ...LSP9Vault],
      UP_ADDRESS,
      window.ethereum
    );

    // @ts-ignore
    const vault: Vault = new ethers.Contract(VAULT_ADDRESS as string, Vault__factory.abi as ContractInterface, signer);
    // contracts
    const up = new ethers.Contract(UP_ADDRESS as string, UniversalProfile.abi, signer as Signer);
    console.log("myUP: ", up);

    const ownerUP = await up?.owner(); // <---- get owner of UP contract
    console.log("ownerUP: ", ownerUP);

    const km = new ethers.Contract(ownerUP as string, KeyManager.abi, signer as Signer);

    setErc725(erc725);
    setUp(up);
    setKm(km);
    setVault(vault);
    setDynamicKey(DYNAMIC_KEY as string);
  };

  const loadMessages: () => any = () => {
    vault.on("DataChanged", async (dataKey) => {
      if (dynamicKey === dataKey) {
        // console.log("message data changed event  ");

        const users = [...chatMetaData["chatUsers"]];

        const vaultChatDataBefore = await vault["getData(bytes32)"](dynamicKey);

        const vaultDecodedStringBefore = erc725?.decodeData({
          // @ts-ignore
          keyName: KEY_NAME,
          dynamicKeyParts: [...users],
          value: vaultChatDataBefore,
        });

        const oldValues = vaultDecodedStringBefore?.value !== null ? vaultDecodedStringBefore?.value : [];
        // console.log("load messages oldValues: ", oldValues);
        const messages: any[] = [];
        if (Array.isArray(oldValues)) {
          // oldValues.map((msg: string) => messages.push(JSON.parse(msg)));
          oldValues.map((msg: string) => Boolean(msg) && messages.push(msg));
        }

        const reqData = {
          type: "DECRYPT",
          encryptedData: messages,
        };

        // get decrypted data from server
        const { data: decryptedData } = await axios.post(`${BASE_URL}/api/encryptDecryptMsg`, {
          ...reqData,
        });

        if (messages.length !== messagesCount.current) {
          setMessagesData(decryptedData.messagesData as []);
          // onMsgIncomingAlert(false);
        }
      }
    });
  };

  const onSendMessage: () => any = async (): Promise<any> => {
    try {
      onMsgIncomingAlert(true);
      setIsMsgSending(true);

      await Sleep(300);
      // get focus on wait alert
      window.document.getElementById("LATEST_MESSAGE")?.scrollIntoView({ behavior: "smooth" });

      const users = [...chatMetaData["chatUsers"]];

      // console.log("dynamicKey: ", dynamicKey);

      const oldChatData = await vault["getData(bytes32)"](dynamicKey);
      // console.log("oldChatData: ", oldChatData);

      const vaultDecodedStringBefore = erc725?.decodeData({
        // @ts-ignore
        keyName: KEY_NAME,
        dynamicKeyParts: [...users],
        value: oldChatData,
      });

      let oldData = vaultDecodedStringBefore?.value !== null ? vaultDecodedStringBefore?.value : [];
      oldData = oldData.filter((msg) => Boolean(msg) === true);

      // console.log("oldData: ", oldData);

      const msgData = {
        address: address,
        message: chatMessage,
      };

      const reqData = {
        type: "ENCRYPT",
        msgData,
      };

      // encrypt the data
      const { data } = await axios.post(`${BASE_URL}/api/encryptDecryptMsg`, {
        ...reqData,
      });

      const encryptedData = data.encryptedData;

      const encodedChatData = erc725?.encodeData({
        // @ts-ignore
        keyName: KEY_NAME,
        dynamicKeyParts: [...users],
        // value: [...oldData, JSON.stringify(msgData)],
        value: [...oldData, encryptedData],
      });

      // @ts-ignore
      const setDataVaultPayload = vault.interface.encodeFunctionData("setData(bytes32[],bytes[])", [
        encodedChatData?.keys,
        encodedChatData?.values,
      ]);

      // @ts-ignore
      const vaultExecutePayload = vault.interface.encodeFunctionData("execute", [
        0,
        vault.address as string,
        0,
        setDataVaultPayload,
      ]);

      // on execute call
      const tx = await km?.connect(signer as Signer).execute(vaultExecutePayload, { gasLimit: 10000000 }); // <---- call the execute on key manager contract
      const rcpt = await tx.wait();

      // onMsgIncomingAlert(false);
      setIsMsgSending(false);
      setChatMessage("");
    } catch (error) {
      console.log("error: ", error);
      window.location.reload();
    }
  };
  const clearChat: () => any = async () => {
    try {
      const users = [...chatMetaData["chatUsers"]];

      setChatMetaData({ ...chatMetaData, CHAT_STATUS: "ENDING" });

      await Sleep(300);
      // get focus on wait alert
      window.document.getElementById("LATEST_MESSAGE")?.scrollIntoView({ behavior: "smooth" });

      const encodedChatData = erc725?.encodeData({
        // @ts-ignore
        keyName: KEY_NAME,
        dynamicKeyParts: [...users],
        value: [""],
      });

      // @ts-ignore
      const setDataVaultPayload = vault.interface.encodeFunctionData("setData(bytes32[],bytes[])", [
        encodedChatData?.keys,
        encodedChatData?.values,
      ]);

      // @ts-ignore
      const vaultExecutePayload = vault.interface.encodeFunctionData("execute", [
        0,
        vault.address as string,
        0,
        setDataVaultPayload,
      ]);

      // on execute call
      const tx = await km?.connect(signer as Signer).execute(vaultExecutePayload, { gasLimit: 10000000 }); // <---- call the execute on key manager contract
      const rcpt = await tx.wait();
      return true;
    } catch (error) {
      console.log("error: ", error);
      return false;
    }
  };

  const onEndChat: () => any = async () => {
    try {
      const isChatCleared = await clearChat();

      if (isChatCleared) {
        const reqData = {
          address,
          operationType: "END_CHAT",
          users: chatMetaData.chatUsers,
        };
        const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
          ...reqData,
        });
        console.log("connectedUserData: ", connectedUserData);
      }

      if (isChatCleared === false) {
        setChatMetaData({ ...chatMetaData, CHAT_STATUS: "START" });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const onDeleteChat: () => any = async (): Promise<any> => {
    if (chatMetaData["CHAT_STATUS"] === "START") {
      await clearChat();
    }

    const reqData = {
      address,
      operationType: "END_CHAT",
      users: chatMetaData.chatUsers,
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });

    setChatMetaData({
      ...chatMetaData,
      activeChat: false,
    });
  };

  // l-useeffect
  useEffect(() => {
    const chatMetaData = JSON.parse(localStorage.getItem("chatMetaData") as string);
    if (signer && chatMetaData && chatMetaData["activeChat"] === true) {
      void loadContracts();
    }
  }, [signer, chatMetaData]);

  // TO FOCUS ON LAST MESSAGE
  useEffect(() => {
    if (window) {
      window.document.getElementById("LATEST_MESSAGE")?.scrollIntoView({ behavior: "smooth" });

      console.log("msg length", messagesData.length, messagesCount.current);
      if (messagesData.length !== messagesCount.current) {
        onMsgIncomingAlert(false);
      }

      messagesCount.current = messagesData.length;
    }
  }, [messagesData]);

  /** ----------------------
   * load messages
   * ---------------------*/

  useEffect(() => {
    if (vault) {
      loadMessages();
    }
  }, [vault]);

  // handle user events from localdata change
  useEffect(() => {
    if (chatMetaData && chatMetaData["activeChat"] === true) {
      // on start chat
      if (chatMetaData["CHAT_STATUS"] === "START") {
        setIsFinding(false);
      }

      // on end chat
      if (chatMetaData["CHAT_STATUS"] === "END") {
        setDynamicKey("");
        setMessagesData([]);
      }
    }
  }, [chatMetaData]);

  return (
    <>
      <div className="flex flex-col items-start justify-center h-[100%] ">
        {/* <div className=""> */}
        {/* chat messages */}
        <div className="p-2 overflow-y-scroll bg-base-200 bg--gray-100 p--8 w-[80%] h-[80vh] ">
          <div className="max-w-4xl mx-auto space-y--12 space-y-4 grid grid-cols-1  ">
            {messagesData &&
              messagesData?.map((data, index) => {
                return (
                  <React.Fragment key={index}>
                    {/* recepient message */}

                    <div
                      className={`text-left place-self-start ${data["address"] !== address ? "block" : "hidden"}`}
                      id={messagesData.length - 1 === index ? "LATEST_MESSAGE" : ""}
                      style={{ scrollBehavior: "smooth" }}>
                      <div className="mb-1">
                        <Blockie address={data["address"]} scale={7} />
                      </div>
                      <div className="p-5 bg-white rounded-tl-none rounded-2xl">{data["message"]}</div>
                    </div>

                    {/* owner message */}
                    <div
                      className={`text-right place-self-end ${data["address"] === address ? "block" : "hidden"} `}
                      id={messagesData.length - 1 === index ? "LATEST_MESSAGE" : ""}
                      style={{ scrollBehavior: "smooth" }}>
                      <div className="p-5 text-green-900 rounded-tr-none bg-green-50 rounded-2xl">
                        {data["message"]}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
          </div>
          {/* find chat loading screen */}
          <div className="h--[70vh] ">
            {messagesData && messagesData.length === 0 && (
              <div className="flex flex-col items-center justify-center">
                {chatMetaData && chatMetaData["CHAT_STATUS"] === "END" && (
                  <>
                    <div>
                      find new chat click on
                      <button className="m-2 btn btn-accent btn-xs" onClick={onStartChat}>
                        New
                      </button>
                    </div>
                  </>
                )}

                {chatMetaData && chatMetaData["CHAT_STATUS"] === "FINDING" && (
                  <div>
                    <div className="opacity-100 mt-44 animate-pulse">Hold on looking for a chat....</div>

                    <div className="mt--44">
                      {chatMetaData["CHAT_STATUS"] === "FINDING" && (
                        <progress className="w-56 progress progress-primary" />
                      )}
                    </div>
                  </div>
                )}

                {chatMetaData && chatMetaData["CHAT_STATUS"] === "START" && (
                  <div className="mt-44">
                    <div className="">Found a match with common interest !!</div>
                    <div className="">Say,hi 👋 to stranger.. </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* real time interaction alert */}
          {isTyping === true && (
            <div className="text-center">
              <div className="animate-bounce">typing...</div>
            </div>
          )}

          {/* on send message alert */}

          {isMsgSending && (
            <div className="flex flex-col items-center justify-center" id="LATEST_MESSAGE">
              <RotatingSquare
                height="100"
                width="100"
                color="#4fa94d"
                ariaLabel="rotating-square-loading"
                strokeWidth="4"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
              />
              <div className="text-opacity-40 text-accent-content">wait sending message...</div>
            </div>
          )}

          {/* on incoming messag alert */}
          {isMsgComing === true && (
            <div className="flex flex-col items-center justify-center">
              <ThreeDots
                height="30"
                width="60"
                radius="10"
                // color="#4fa94d"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClass="flex justify-center "
                visible={true}
              />
              <div className="text-opacity-40 text-accent-content" id="LATEST_MESSAGE">
                Wait incoming message...
              </div>
            </div>
          )}

          {/* on message end  */}

          {chatMetaData && chatMetaData["CHAT_STATUS"] === "ENDING" && (
            <>
              <div className="flex flex-col items-center justify-center mt-44">
                <div className="text-opacity-40 text-accent-content" id="LATEST_MESSAGE">
                  Wait ending the chat...
                </div>
                <FallingLines color="#4fa94d" width="100" visible={true} />
              </div>
            </>
          )}
        </div>

        {/* MESSAGE INPUT  */}
        <div className="sticky bottom-0 z-50 w-[80%] ">
          <div className="form-control">
            <div className="input-group ">
              {chatMetaData && chatMetaData["CHAT_STATUS"] === "FINDING" && (
                <>
                  <button className="btn btn-error  " onClick={onStopChat}>
                    Stop
                  </button>
                </>
              )}

              {chatMetaData && chatMetaData["CHAT_STATUS"] === "END" && (
                <>
                  <button className="btn btn-accent  " onClick={onStartChat}>
                    New
                  </button>
                </>
              )}

              {chatMetaData && chatMetaData["CHAT_STATUS"] === "START" && (
                <>
                  <button className="btn btn-warning  " onClick={onEndChat}>
                    End
                  </button>
                </>
              )}

              <input
                type="text"
                placeholder="Type a message (press enter to send)"
                className="w-full input input-bordered rounded-l-md"
                value={chatMessage}
                onChange={(e): any => setChatMessage(e.target.value)}
                onKeyDown={(e): any =>
                  e.key === "Enter" && isMsgSending === false && Boolean(dynamicKey) && onSendMessage()
                }
                disabled={isMsgSending === true || chatMetaData["CHAT_STATUS"] === "END"}
                onFocus={(): any => {
                  onTypingAlert(true);
                }}
                onBlur={(): any => {
                  onTypingAlert(false);
                }}
              />
              <button
                className="btn btn-primary  "
                onClick={onSendMessage}
                disabled={isMsgComing === true || isMsgSending === true || chatMetaData["CHAT_STATUS"] === "END"}>
                <TbSend scale={100} />
              </button>

              <button className="btn btn-error  " onClick={onDeleteChat}>
                <RiDeleteBinLine scale={100} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatView;
