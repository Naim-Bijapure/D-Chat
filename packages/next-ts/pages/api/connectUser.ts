// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import ERC725 from "@erc725/erc725.js";
import type { NextApiRequest } from "next";

import { connectUsersType, NextApiResponseWithSocket } from "../../types";

type Data = {
  users?: string[];
  dynamicKey?: string;
  status?: string;
};

const KEY_NAME = "chat:<string>:<string>";

// type connectUsersType = Record<string, { interests: string[]; users?: string[]; dynamicKey?: string; status?: string }>;

const connectUsers: connectUsersType = {};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket): any {
  const reqData = req.body;
  const userAddress = reqData.address;
  const interests = reqData.interests;
  const operationType = reqData.operationType;
  console.log("reqData: ", reqData);

  /** ----------------------
   * ON FIND USER
   * ---------------------*/
  if (operationType === "findUser") {
    let isInterestMatching = false;
    let matchedAdress = "0x";
    // find any exissting match
    for (const addressKey in connectUsers) {
      if (addressKey !== userAddress) {
        const userData = connectUsers[addressKey];
        isInterestMatching = userData.interests.some((interest) => interests.includes(interest));
        if (isInterestMatching) {
          const addresses = [addressKey, userAddress].sort();
          connectUsers[addressKey].users = addresses;
          matchedAdress = addressKey;

          // create a dynamic uinque key
          const dynamicKey = ERC725.encodeKeyName(KEY_NAME, [...addresses]);
          connectUsers[addressKey].dynamicKey = dynamicKey;
          connectUsers[addressKey].status = "MATCH";

          break;
        }
      }
    }

    // if no intereset matching then create a new entry
    if (userAddress in connectUsers === false && isInterestMatching === false) {
      connectUsers[userAddress] = {
        interests,
        status: "NO_MATCH",
      };
    }

    // global.connectUsers = connectUsers;

    if (connectUsers[matchedAdress]) {
      console.log("connectUsers[matchedAdress]: ", connectUsers[matchedAdress]);
      const userData = connectUsers[matchedAdress];
      res.socket.server.io.to(userData.users![0]).emit("MATCH", userData);
      res.socket.server.io.to(userData.users![1]).emit("MATCH", userData);

      // emit the connected data
      return res.status(200).json({
        ...connectUsers[matchedAdress],
      });
    }

    if (connectUsers[matchedAdress] === undefined) {
      console.log("connectUsers[userAddress]: ", connectUsers[userAddress]);
      return res.status(200).json({
        ...connectUsers[userAddress],
      });
    }
  }

  /** ----------------------
   * ON CLEAR USER CHAT DATA
   * ---------------------*/
  if (operationType === "clearChatData") {
    res.status(200).json({ status: "NO_MATCH" });
  }
}
