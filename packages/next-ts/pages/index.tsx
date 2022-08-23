/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import axios from "axios";
import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { BsPlusCircle } from "react-icons/bs";
import { TiDeleteOutline } from "react-icons/ti";
import { Socket } from "socket.io";
import io from "socket.io-client";
import { useAccount } from "wagmi";

import ChatView from "../components/Chat/ChatView";
import { Sleep } from "../components/DebugContract/configs/utils";
import useLocalStorage from "../hooks/useLocalStorage";
import { connectUserReponseType } from "../types";

let socket: Socket;

const Home: NextPage = () => {
  const BASE_URL = window?.location.origin;

  // l-states
  // const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState<string>("");
  const [isFinding, setIsFinding] = useState<boolean>(false);
  const [fetchToggler, setFetchToggler] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { address, isConnected } = useAccount();
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
    console.log("onStartChat: ", interests);

    // GRANT THE USER PERMISSION
    let response = await axios.get(`/api/grantPermission?address=${address}`);
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
  };

  const onTest: () => any = () => {
    console.log("onTest: ");
    // const addrArray = [
    //   "0x7cC872ADc952186D7E9C8C8575cb407cb4046230",
    //   "0xDc33aB45de06754C667d438f1C975C3c45a986E1",
    //   "0x0fAb64624733a7020D332203568754EB1a37DB89",
    // ];
    // // const result = addrArray.sort();
    // const result = addrArray;
    // console.log("result: ", result);
    // window.document.getElementById("LATEST_MESSAGE")?.scrollIntoView({ behavior: "smooth" });
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
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`/api/connectUser`, {
      ...reqData,
    });
  };

  const onAddInterest: () => any = async (): Promise<any> => {
    setInterests([...new Set([...interests, currentInterest])]);
    setCurrentInterest("");
  };

  const onDeleteInterest: (arg: string) => any = async (toDeleteInterest): Promise<any> => {
    const updatedInterestList = interests.filter((interestValue) => interestValue !== toDeleteInterest);
    setInterests(updatedInterestList);
  };

  const findMatch: () => any = async (): Promise<any> => {
    console.log("findMatch:... ");
    //  CONNECT USER API
    const reqData = {
      address,
      interests,
      operationType: "findUser",
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`/api/connectUser`, {
      ...reqData,
    });
    console.log("connectedUserData: ", connectedUserData);
    console.log("isFinding: ", isFinding);
    if (connectedUserData.status === "MATCH" && isFinding === true) {
      setIsFinding(false);

      // // GRANT THE USER PERMISSION
      // let response = await fetch(`${BASE_URL}/api/grantPermission?address=${address}`);
      // response = await response.json();
      // console.log("response: ", response);

      // const UP_ADDRESS = response["UP_ADDRESS"];
      // const VAULT_ADDRESS = response["VAULT_ADDRESS"];
      // // TEMP CONNECT USER API (MAKE IT DYNAMIMC WITH RANDOMLY USER CONNECTION)
      // const dynamicKey = connectedUserData.dynamicKey;

      // setChatMetaData({
      //   ...chatMetaData,
      //   chatUsers: [...(connectedUserData.users as string[])],
      //   activeChat: true,
      //   UP_ADDRESS,
      //   VAULT_ADDRESS,
      //   dynamicKey,
      // });

      const dynamicKey = connectedUserData.dynamicKey;
      setChatMetaData({
        ...chatMetaData,
        chatUsers: [...(connectedUserData.users as string[])],
        activeChat: true,
        DYNAMIC_KEY: dynamicKey,
      });
    }

    setTimeout(() => {
      setFetchToggler((preVal) => !preVal);
    }, 2000);
  };

  const onSocketListener: () => any = async () => {
    await axios.get("/api/socket");
    socket = io();

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
        // activeChat: true,
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
  };

  const onStartChat: () => any = async () => {
    const localChatMetaData = JSON.parse(localStorage.getItem("chatMetaData") as string);
    setChatMetaData({ ...localChatMetaData, CHAT_STATUS: "FINDING" });

    await Sleep(2000);

    const reqData = {
      address,
      interests,
      operationType: "findUser",
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`/api/connectUser`, {
      ...reqData,
    });
  };

  const onStopChat: () => any = async () => {
    const reqData = {
      address,
      operationType: "END_CHAT",
      users: [address],
    };
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`/api/connectUser`, {
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
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`/api/connectUser`, {
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
    const { data: connectedUserData } = await axios.post<connectUserReponseType>(`/api/connectUser`, {
      ...reqData,
    });
    console.log("connectedUserData: ", connectedUserData);
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
  }, [mounted]);

  return (
    <>
      <main className="flex  items-start justify-around h-[100%] ">
        {/* <button className="btn btn-primary" onClick={onTest}>
          Test
        </button> */}

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
                      <TiDeleteOutline onClick={(): any => onDeleteInterest(interest)} />
                    </div>
                  </React.Fragment>
                ))}
            </div>

            {/* find button */}
            <button className="m-1 btn btn-accent " onClick={onCreateChat} disabled={interests.length === 0}>
              find random chat
            </button>

            {/* <div className="m-1">{isFinding && <progress className="w-56 progress progress-primary" />}</div> */}
          </div>
        )}

        {/* ON ACTIVE CHAT */}
        {chatMetaData && chatMetaData["activeChat"] === true && (
          <div className="w-[100%]">
            <ChatView
              onDeleteChat={onDeleteChat}
              chatMetaData={chatMetaData}
              interests={interests}
              setChatMetaData={setChatMetaData}
              onEndChat={onEndChat}
              onStartChat={onStartChat}
              onStopChat={onStopChat}
              onTypingAlert={onTypingAlert}
              isTyping={isTyping}
            />
          </div>
        )}

        {/* TODO:ui improvements */}
        {isConnected === false && (
          <>
            <div>please connect with app first</div>
          </>
        )}

        {/* extra side info */}
        {/* <div className="w-[10%]">extra info display view if needed</div> */}
      </main>
    </>
  );
};

export default Home;
