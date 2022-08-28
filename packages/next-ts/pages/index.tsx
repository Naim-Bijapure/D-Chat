import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";

import ChatView from "../components/Chat/ChatView";
import useLocalStorage from "../hooks/useLocalStorage";

const Home: NextPage = () => {
  // local storage states
  const [chatMetaData, setChatMetaData] = useLocalStorage("chatMetaData", {
    activeChat: false,
    chatUsers: [],
    UP_ADDRESS: "",
    VAULT_ADDRESS: "",
    DYNAMIC_KEY: "",
  });

  const { address } = useAccount();
  const { data } = useBalance({ addressOrName: address });

  // const YourContract = useAppLoadContract({
  //   contractName: "YourContract",
  // });

  // const getPurpose = useCallback(async () => {
  //   const purpose = await YourContract?.purpose();
  //   console.log("Purpose", purpose);
  //   setContractPurpose(purpose as string);
  // }, [YourContract]);

  // useEffect(() => {
  //   // console.log("chatData: ", chatMetaData);
  // }, [chatMetaData]);

  const onStartChat: () => any = async (): Promise<any> => {
    const BASE_URL = window.location.origin;
    // grant the user permission
    let response = await fetch(`${BASE_URL}/api/grantPermission?address=${address}`);
    response = await response.json();
    console.log("response: ", response);

    const UP_ADDRESS = response["UP_ADDRESS"];
    const VAULT_ADDRESS = response["VAULT_ADDRESS"];

    // temp connect user api (make it dynamimc with randomly user connection)
    let connectedUserData = await fetch(`${BASE_URL}/api/connectUser`);
    connectedUserData = await connectedUserData.json();
    const DYNAMIC_KEY = connectedUserData["dynamicKey"];
    console.log("connectedUserData: ", connectedUserData);

    setChatMetaData({
      ...chatMetaData,
      chatUsers: [...connectedUserData["chatUsers"]],
      activeChat: true,
      UP_ADDRESS,
      VAULT_ADDRESS,
      DYNAMIC_KEY,
    });
  };

  const onTest: () => any = () => {
    const addrArray = [
      "0x7cC872ADc952186D7E9C8C8575cb407cb4046230",
      "0xDc33aB45de06754C667d438f1C975C3c45a986E1",
      "0x0fAb64624733a7020D332203568754EB1a37DB89",
    ];
    // const result = addrArray.sort();
    const result = addrArray;
    console.log("result: ", result);

    window.document.getElementById("LATEST_MESSAGE")?.scrollIntoView({ behavior: "smooth" });
  };

  const onDeleteChat: () => any = async (): Promise<any> => {
    setChatMetaData({
      activeChat: false,
    });
    // window.location.reload();
  };

  // console.log("chatMetaData: ", chatMetaData);

  return (
    <>
      <main className="flex items-start justify-around h-[100%] ">
        {/* on active chat */}

        {/* <button className="btn btn-primary" onClick={onTest}>
          Test
        </button> */}

        {chatMetaData && chatMetaData["activeChat"] === true && (
          <div className="w-[100%]">
            <ChatView onDeleteChat={onDeleteChat} chatMetaData={chatMetaData} setChatMetaData={setChatMetaData} />
          </div>
        )}

        {chatMetaData && chatMetaData["activeChat"] === false && (
          <div className="self-center w-[50%]">
            <button className="btn btn-primary" onClick={onStartChat}>
              start random chat
            </button>
          </div>
        )}

        {/* extra side info */}
        {/* <div className="w-[10%]">extra info display view if needed</div> */}
      </main>
    </>
  );
};

export default Home;
