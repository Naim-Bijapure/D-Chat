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
  const [toAddress, setToAddress] = useLocalStorage("toAddress", "");

  // l-wagmi hooks
  const { data: balance } = useBalance({
    addressOrName: address,
  });

  // l-localStorages  states
  const [chatMetaDataDirect, setChatMetaDataDirect] = useLocalStorage("chatMetaDataDirect", {
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

    const UP_ADDRESS = responseAddress["UP_ADDRESS"];
    const VAULT_ADDRESS = responseAddress["VAULT_ADDRESS"];

    setChatMetaDataDirect({
      ...chatMetaDataDirect,
      UP_ADDRESS,
      VAULT_ADDRESS,
    });
  };

  // l-methods
  const onCreateChat: () => any = async (): Promise<any> => {
    setIsCreatingChat(true);

    setChatMetaDataDirect({
      ...chatMetaDataDirect,
      activeChat: true,
      CHAT_STATUS: "END",
    });

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

  const onSocketListener: () => any = async () => {
    await axios.get(`${BASE_URL}/`);
    // @ts-ignore
    socket = io(BASE_URL);

    socket.on("connect", () => {});

    // join a user address room
    if (isConnected === true) {
      socket?.emit("createRoom", address);
    }

    socket.on("MATCH", (data) => {
      const localChatMetaData = JSON.parse(localStorage.getItem("chatMetaDataDirect") as string);

      setChatMetaDataDirect({
        ...localChatMetaData,
        chatUsers: [...(data.users as string[])],
        activeChat: true,
        DYNAMIC_KEY: data.dynamicKey,
        CHAT_STATUS: "START",
      });

      const localChatMetaData1 = JSON.parse(localStorage.getItem("chatMetaDataDirect") as string);
    });

    socket.on("END_CHAT", (data) => {
      const localChatMetaData = JSON.parse(localStorage.getItem("chatMetaDataDirect") as string);

      setChatMetaDataDirect({
        ...localChatMetaData,
        chatUsers: [],
        activeChat: true,
        DYNAMIC_KEY: undefined,
        CHAT_STATUS: "END",
      });
    });

    socket.on("TYPING_ALERT", (typingStatus) => {
      //
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
  };

  const onTypingAlert: (isFocus: boolean) => any = async (isFocus: boolean) => {
    const reqData = {
      address,
      operationType: "TYPING_ALERT",
      users: chatMetaDataDirect.chatUsers,
      isFocus,
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });
  };

  const onMsgIncomingAlert: (isFocus: boolean) => any = async (isFocus: boolean) => {
    const reqData = {
      address,
      operationType: "MSG_INCOMING_ALERT",
      users: chatMetaDataDirect.chatUsers,
      isFocus,
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`${BASE_URL}/api/connectUser`, {
      ...reqData,
    });
  };

  // l-useEffects
  // check is connected or not then reset the local states
  useEffect(() => {
    if (isConnected === false) {
      setChatMetaDataDirect({ activeChat: false });
    }

    // join the user address room
  }, [isConnected]);

  useEffect(() => setMounted(true), []); // at init only

  useEffect((): any => {
    if (mounted) {
      void onSocketListener();
      void onConnect();
    }
  }, [mounted, isConnected]);

  return (
    <>
      <main className="flex flex-col items-center justify-around h-[100%]">
        {chatMetaDataDirect && chatMetaDataDirect["activeChat"] === false && isConnected === true && (
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
              <a href="https://faucet.l16.lukso.network" target={"_blank"} rel="noreferrer" className="link-primary">
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
        {chatMetaDataDirect && chatMetaDataDirect["activeChat"] === true && isCreatingChat === false && (
          <div className="w-[100%]">
            <DirectChatView
              chatMetaData={chatMetaDataDirect}
              setChatMetaData={setChatMetaDataDirect}
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
      </main>
    </>
  );
};

export default DirectChat;
