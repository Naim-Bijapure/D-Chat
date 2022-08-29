/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios from "axios";
import type { NextPage } from "next";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { MutatingDots } from "react-loader-spinner";
import { Socket } from "socket.io";
import io from "socket.io-client";
import { useAccount, useBalance, useSigner } from "wagmi";

import DirectChatView from "../components/Chat/DirectChatView";
import { Sleep } from "../components/DebugContract/configs/utils";
import { BASE_URL } from "../constants";
import useLocalStorage from "../hooks/useLocalStorage";
import { connectUserReponseType } from "../types";

let socket: Socket;

const DirectChat: NextPage = () => {
  // l-states
  const [mounted, setMounted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMsgComing, setIsMsgComing] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const { address, isConnected } = useAccount();
  const [ toAddress, setToAddress] = useLocalStorage("toAddress", "");

  // l-wagmi hooks
  const { data: signer } = useSigner();
  const { data: balance } = useBalance({
    addressOrName: address,
  });

  // l-localStorages  states
  const [chatMetaData, setChatMetaData] = useLocalStorage("chatMetaData", {
    activeChat: false,
    chatUsers: [],
    UP_ADDRESS: "",
    VAULT_ADDRESS: "",
    DYNAMIC_KEY: "",
    CHAT_STATUS: "END",
  });

  const onConnect: () => any = async (): Promise<any> => {

    let responseAddress = await axios.get(`${BASE_URL}/api/grantPermission?address=${address}`);
    responseAddress = await responseAddress.data;
    console.log("responseAddress: ", responseAddress);

    const UP_ADDRESS = responseAddress["UP_ADDRESS"];
    const VAULT_ADDRESS = responseAddress["VAULT_ADDRESS"];

    setChatMetaData({
      ...chatMetaData,
      UP_ADDRESS,
      VAULT_ADDRESS,
      CHAT_STATUS: "END",
    });

    console.log("chatMetaData: ", chatMetaData);
  }



  // l-methods
  const onCreateChat: () => any = async (): Promise<any> => {
    setIsCreatingChat(true);
    // console.log("onCreateChat: ", address, toAddress);

    setChatMetaData({
      ...chatMetaData,
      activeChat: true,
      CHAT_STATUS: "END",
    });

    // const localChatMetaData = JSON.parse(localStorage.getItem("chatMetaData") as string);
    // setChatMetaData({ ...localChatMetaData, CHAT_STATUS: "FINDING" });

    await Sleep(2000);

    const reqData = {
      address,
      toAddress,
      operationType: "directChat",
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });

    setIsCreatingChat(false);

  };

  const onDeleteChat: () => any = async (): Promise<any> => {
    setChatMetaData({
      activeChat: false,
    });

    const reqData = {
      address,
      operationType: "END_CHAT",
      users: chatMetaData.chatUsers,
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });
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
      console.log("data:match ", data);

      const localChatMetaData = JSON.parse(localStorage.getItem("chatMetaData") as string);

      setChatMetaData({
        ...localChatMetaData,
        chatUsers: [...(data.users as string[])],
        activeChat: true,
        DYNAMIC_KEY: data.dynamicKey,
        CHAT_STATUS: "START",
      });

      const localChatMetaData1 = JSON.parse(localStorage.getItem("chatMetaData") as string);
      console.log("localChatMetaData1: ", localChatMetaData1);
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
      console.log("typingStatus: ", typingStatus);
      setIsTyping(typingStatus as boolean);
    });

    socket.on("MSG_INCOMING_ALERT", async (msgIncomingStatus) => {
      setIsMsgComing(msgIncomingStatus as boolean);

      await Sleep(400);
      window.document.getElementById("LATEST_MESSAGE")?.scrollIntoView({ behavior: "smooth" });
    });
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
    console.log("isFocus: ", isFocus);
    const reqData = {
      address,
      operationType: "TYPING_ALERT",
      users: chatMetaData.chatUsers,
      isFocus,
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });
    console.log("connectedUserData: ", connectedUserData);
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
      void onConnect();
    }
  }, [mounted, isConnected]);

  return (
    <>
      <main className="flex flex-col items-start justify-around h-[100%]">
        {chatMetaData && chatMetaData["activeChat"] === false && isConnected === true && (
          <div className="flex flex-col items-start self-center mt-8 w-[40%]">
            {/* toAddress input */}
            <div className="m-1 form-control">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter your friend's address"
                  className="input input-bordered"
                  value={toAddress}
                  onChange={(e): any => setToAddress(e.target.value.trim())}
                />
                <button className="btn btn-primary" onClick={onCreateChat}>
                  CREATE CHAT
                </button>
              </div>
            </div>
          </div>
        )}

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
            </div>
          </>
        )}

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

        {/* ON ACTIVE CHAT */}
        {chatMetaData && chatMetaData["activeChat"] === true && (
          <div className="w-[100%]">
            <DirectChatView
              // onDeleteChat={onDeleteChat}
              // onEndChat={onEndChat}
              chatMetaData={chatMetaData}
              setChatMetaData={setChatMetaData}
              onStopChat={onStopChat}
              onTypingAlert={onTypingAlert}
              isTyping={isTyping}
              onMsgIncomingAlert={onMsgIncomingAlert}
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

export default DirectChat;
