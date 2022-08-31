/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios from "axios";
import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { BsPlusCircle } from "react-icons/bs";
import { TiDeleteOutline } from "react-icons/ti";
import { MutatingDots, Watch } from "react-loader-spinner";
import { Socket } from "socket.io";
import io from "socket.io-client";
import { useAccount, useBalance, useSigner } from "wagmi";
import Image from "next/image";

import ChatView from "../components/Chat/ChatView";
import { Sleep } from "../components/DebugContract/configs/utils";
import { BASE_URL } from "../constants";
import useLocalStorage from "../hooks/useLocalStorage";
import { connectUserReponseType } from "../types";

let socket: Socket;

const Home: NextPage = () => {
  // const BASE_URL = window?.location.origin;

  // l-states
  // const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState<string>("");
  const [isFinding, setIsFinding] = useState<boolean>(false);
  const [fetchToggler, setFetchToggler] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMsgComing, setIsMsgComing] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [sendFundStatus, setSendFundStatus] = useState("");
  const [isSendingFunds, setIsSendingFunds] = useState(false);

  // l-wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const { data: balance } = useBalance({
    addressOrName: address,
  });

  // const { data } = useBalance({ addressOrName: address });

  // l-localStorages  states
  const [chatMetaData, setChatMetaData] = useLocalStorage("chatMetaData", {
    activeChat: false,
    chatUsers: [],
    UP_ADDRESS: "",
    VAULT_ADDRESS: "",
    DYNAMIC_KEY: "",
    CHAT_STATUS: "END",
  });

  const [interests, setInterests] = useLocalStorage("interests", []);

  // l-methods
  const onCreateChat: () => any = async (): Promise<any> => {
    // console.log("onStartChat: ", interests);
    setIsCreatingChat(true);

    // GRANT THE USER PERMISSION
    let response = await axios.get(`${BASE_URL}/api/grantPermission?address=${address}`);
    response = await response.data;
    console.log("response: ", response);

    const UP_ADDRESS = response["UP_ADDRESS"];
    const VAULT_ADDRESS = response["VAULT_ADDRESS"];

    setChatMetaData({
      ...chatMetaData,
      activeChat: true,
      UP_ADDRESS,
      VAULT_ADDRESS,
      CHAT_STATUS: "END",
    });

    setIsCreatingChat(false);
  };

  const onTest: () => any = async (): Promise<any> => {
    console.log("onTest: ");
    // window.document.getElementById("LATEST_MESSAGE")?.scrollIntoView({ behavior: "smooth" });
    // const sign = await signer?.signMessage("cool man");
    // console.log("sign: ", sign);

    console.log("balance: ", balance?.value.toString());
    // const addr = await signer?.getAddress();
    // console.log('addr: ', addr);
  };

  const sendFunds: () => any = async (): Promise<any> => {
    setIsSendingFunds(true);
    await Sleep(2000);
    let response: any = await axios.get(`${BASE_URL}/api/fundAddress/?address=${address}`);
    response = await response.data;
    console.log("response: ", response);
    if (response.msg === "FUNDED") {
      setSendFundStatus("funded !!");
      window.location.reload();
    }

    if (response.msg === "NOT_FUNDED") {
      setSendFundStatus("not funded !!");
    }

    setIsSendingFunds(false);
  };

  const onAddInterest: () => any = (): any => {
    setInterests([...new Set([...interests, currentInterest])]);
    setCurrentInterest("");
  };

  const onDeleteInterest: (arg: string) => any = (toDeleteInterest): any => {
    const updatedInterestList = interests.filter((interestValue) => interestValue !== toDeleteInterest);
    setInterests(updatedInterestList);
  };

  const onSocketListener: () => any = async () => {
    await axios.get(`${BASE_URL}/`);
    // @ts-ignore
    socket = io(BASE_URL);

    socket.on("connect", () => {
      console.log("CONNECTED");
    });

    // join a user address room
    if (isConnected === true) {
      socket?.emit("createRoom", address);
    }

    socket.on("MATCH", (data) => {
      const localChatMetaData = JSON.parse(localStorage.getItem("chatMetaData") as string);

      setChatMetaData({
        ...localChatMetaData,
        chatUsers: [...(data.users as string[])],
        // activeChat: true,
        DYNAMIC_KEY: data.dynamicKey,
        CHAT_STATUS: "START",
      });

      // const localChatMetaData1 = JSON.parse(localStorage.getItem("chatMetaData") as string);
      // console.log("localChatMetaData1: ", localChatMetaData1);
    });

    socket.on("END_CHAT", (data) => {
      // console.log('"END_CHAT": ', data);
      // console.log("chatMetaData: ", chatMetaData);

      const localChatMetaData = JSON.parse(localStorage.getItem("chatMetaData") as string);

      setChatMetaData({
        ...localChatMetaData,
        chatUsers: [],
        activeChat: true,
        DYNAMIC_KEY: undefined,
        CHAT_STATUS: "END",
      });
    });

    socket.on("TYPING_ALERT", (typingStatus) => {
      // console.log("typingStatus: ", typingStatus);
      setIsTyping(typingStatus as boolean);

      // await Sleep(400);
      window.document.getElementById("LATEST_MESSAGE")?.scrollIntoView({ behavior: "smooth" });
    });

    socket.on("MSG_INCOMING_ALERT", async (msgIncomingStatus) => {
      setIsMsgComing(msgIncomingStatus as boolean);

      await Sleep(400);
      window.document.getElementById("LATEST_MESSAGE")?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const onStartChat: () => any = async () => {
    const localChatMetaData = JSON.parse(localStorage.getItem("chatMetaData") as string);
    setChatMetaData({ ...localChatMetaData, CHAT_STATUS: "FINDING" });

    await Sleep(100);

    const reqData = {
      address,
      interests,
      operationType: "findUser",
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });

    //  reset after certain time if user still finding
    await Sleep(60000);
    const localChatMetaData_updated = JSON.parse(localStorage.getItem("chatMetaData") as string);
    if (localChatMetaData_updated && localChatMetaData_updated.CHAT_STATUS === "FINDING") {
      setChatMetaData({ ...localChatMetaData, CHAT_STATUS: "END" });
    }
  };

  const onStopChat: () => any = async () => {
    const reqData = {
      address,
      operationType: "END_CHAT",
      users: [address],
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });
    console.log("connectedUserData: ", connectedUserData);
  };

  const onEndChat: () => any = async () => {
    const reqData = {
      address,
      operationType: "END_CHAT",
      users: chatMetaData.chatUsers,
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });
    console.log("connectedUserData: ", connectedUserData);
  };

  const onTypingAlert: (isFocus: boolean) => any = async (isFocus: boolean) => {
    const reqData = {
      address,
      operationType: "TYPING_ALERT",
      users: chatMetaData.chatUsers,
      isFocus,
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });
    // console.log("connectedUserData: ", connectedUserData);
  };

  const onMsgIncomingAlert: (isFocus: boolean) => any = async (isFocus: boolean) => {
    const reqData = {
      address,
      operationType: "MSG_INCOMING_ALERT",
      users: chatMetaData.chatUsers,
      isFocus,
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });
    // console.log("connectedUserData: ", connectedUserData);
  };

  // l-useEffects
  // check is connected or not then reset the local states
  useEffect(() => {
    if (isConnected === false) {
      setChatMetaData({ activeChat: false });
    }

    // join the user address room
  }, [isConnected]);

  useEffect(() => setMounted(true), []); // at init only

  useEffect((): any => {
    if (mounted) {
      console.log("useEffect: socket initilizer");
      void onSocketListener();
    }
  }, [mounted, isConnected]);

  return (
    <>
      <main className="flex flex-col items-start justify-around h-[100%] ">
        {/* <button className="btn btn-primary" onClick={onTest}>
          Test
        </button> */}
        <div className="text-xs text-accent">If tx gets slow please supply more gas {"fee's"}</div>

        {chatMetaData && chatMetaData["activeChat"] === false && isConnected === true && (
          <div className="flex flex-col items-start self-center mt-8 w-[40%]">
            {/* interest input */}
            <div className="m-1 form-control">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter your interests"
                  className="input input-bordered"
                  value={currentInterest}
                  onChange={(e): any => setCurrentInterest(e.target.value.trim())}
                />
                <button className="btn btn-primary" onClick={onAddInterest}>
                  <BsPlusCircle />
                </button>
              </div>
            </div>

            {/* interests display */}
            <div className="m-1">
              {interests.length > 0 &&
                interests.map((interest, index) => (
                  <React.Fragment key={index}>
                    <div className="m-1 cursor-pointer badge badge-info gap-2 rounded-xl">
                      {interest}
                      <TiDeleteOutline onClick={(): any => onDeleteInterest(interest as string)} />
                    </div>
                  </React.Fragment>
                ))}
            </div>

            {/* find button */}
            <button
              className="m-1 btn btn-accent "
              onClick={onCreateChat}
              disabled={interests.length === 0 || balance?.value.toString() === "0"}>
              find random chat
            </button>

            {balance?.value.toString() === "0" && (
              <>
                <div className="m-2 text-warning">
                  <div>Look like you dont have LXYT tokens</div>
                  <div>get some lukso faucet from here:</div>
                  <a
                    href="https://faucet.l16.lukso.network"
                    target={"_blank"}
                    rel="noreferrer"
                    className="link-primary">
                    https://faucet.l16.lukso.network
                  </a>
                  <div className="text-primary">Or</div>
                  <div className="text-success">get a quick fund to test (click below button)</div>
                  <div>
                    <button className="btn btn-secondary" onClick={sendFunds}>
                      Get 2 lxyt
                    </button>
                  </div>
                  {sendFundStatus && (
                    <>
                      <div>{sendFundStatus}</div>
                    </>
                  )}
                  {isSendingFunds && (
                    <div className="m-2">
                      <Watch
                        height="80"
                        width="80"
                        radius="48"
                        color="#4fa94d"
                        ariaLabel="watch-loading"
                        wrapperStyle={{}}
                        visible={true}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
            {/* <div className="m-1">{isFinding && <progress className="w-56 progress progress-primary" />}</div> */}

            {isCreatingChat && (
              <div className="flex flex-col justify-center m-1 ">
                <div className="text-opacity-40 text-accent-content">Loading Chat...</div>
                <MutatingDots
                  height="100"
                  width="100"
                  color="#4fa94d"
                  secondaryColor="#4fa94d"
                  radius="12.5"
                  ariaLabel="mutating-dots-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </div>
            )}
          </div>
        )}

        {/* ON ACTIVE CHAT */}
        {chatMetaData && chatMetaData["activeChat"] === true && (
          <div className="w-[100%]">
            <ChatView
              // onDeleteChat={onDeleteChat}
              chatMetaData={chatMetaData}
              interests={interests}
              setChatMetaData={setChatMetaData}
              // onEndChat={onEndChat}
              onStartChat={onStartChat}
              onStopChat={onStopChat}
              onTypingAlert={onTypingAlert}
              onMsgIncomingAlert={onMsgIncomingAlert}
              isTyping={isTyping}
              isMsgComing={isMsgComing}
            />
          </div>
        )}

        {/* TODO:ui improvements */}
        {isConnected === false && (
          <>
            <div className="m-2 shadow-lg alert">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="flex-shrink-0 w-6 h-6 stroke-info">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 className="font-bold">Please connect a wallet first!</h3>
                </div>
              </div>
            </div>
            <div className="m-2">
              <div className="text-primary ">
                If you are using Lukso UP browser extension use injected wallet to connect
              </div>
              <div>
                <Image src={"/up_connect.png"} width={700} height={500} />
              </div>
            </div>
          </>
        )}

        {/* extra side info */}
        {/* <div className="w-[10%]">extra info display view if needed</div> */}
      </main>
    </>
  );
};

export default Home;
