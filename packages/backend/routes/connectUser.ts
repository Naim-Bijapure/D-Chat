import ERC725 from "@erc725/erc725.js";
import { ethers, Signer } from "ethers";
import { Router } from "express";
import { KEY_NAME, UP_ADDRESS, VAULT_ADDRESS } from "../constants";
import { connectUsersType } from "../types";

const router = Router();

const connectUsers: connectUsersType = {};

router.post("/", async (req, res) => {
	const reqData = req.body;
	const userAddress = reqData.address;
	const toAddress = reqData.toAddress; // Added for DirectChat
	const operationType = reqData.operationType;
	console.log("reqData: ", reqData);

	/** ----------------------
	* ON DIRECT CHAT
	* ---------------------*/

	if (operationType === "directChat") {
		let matchedAdress = "0x";
		connectUsers[userAddress] = {
			status: "NO_MATCH",
		};

		const addresses = [toAddress, userAddress].sort();
		connectUsers[userAddress].users = addresses;
		matchedAdress = userAddress;

		// create a dynamic uinque key
		const dynamicKey = ERC725.encodeKeyName(KEY_NAME, [...addresses]);
		connectUsers[userAddress].dynamicKey = dynamicKey;
		connectUsers[userAddress].status = "MATCH";

		if (connectUsers[matchedAdress]) {
			const userData = connectUsers[matchedAdress];
			console.log("userData: ", userData);
			global.io.to(userData.users![0]).emit("MATCH", userData);
			global.io.to(userData.users![1]).emit("MATCH", userData);

			// emit the connected data
			return res.status(200).json({
				...connectUsers[matchedAdress],
			});
		}

		if (connectUsers[matchedAdress] === undefined) {
			return res.status(200).json({
				...connectUsers[userAddress],
			});
		}
	}

  /** ----------------------
   * ON FIND USER
   * ---------------------*/
  if (operationType === "findUser") {
    const interests = reqData.interests;

    let isInterestMatching = false;
    let matchedAdress = "0x";
    // find any exissting match
    for (const addressKey in connectUsers) {
      if (addressKey !== userAddress) {
        const userData = connectUsers[addressKey];
        isInterestMatching = userData.interests.some((interest) =>
          interests.includes(interest)
        );
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
      // console.log("connectUsers[matchedAdress]: ", connectUsers[matchedAdress]);
      const userData = connectUsers[matchedAdress];
      console.log("userData:MATCH ", userData);
      console.log("userData.users![0]: ", userData.users![0]);
      console.log("userData.users![1]: ", userData.users![1]);

      global.io.to(userData.users![0]).emit("MATCH", userData);
      global.io.to(userData.users![1]).emit("MATCH", userData);

      // emit the connected data
      return res.status(200).json({
        ...connectUsers[matchedAdress],
      });
    }

    if (connectUsers[matchedAdress] === undefined) {
      // console.log("connectUsers[userAddress]: ", connectUsers[userAddress]);
      return res.status(200).json({
        ...connectUsers[userAddress],
      });
    }
  }

  /** ----------------------
   * ON CLEAR USER CHAT DATA
   * ---------------------*/
  if (operationType === "END_CHAT") {
    const users = reqData.users as string[];
    console.log("users: ", users);
    global.io.to(users[0]).emit("END_CHAT", true);
    users[1] && global.io.to(users[1]).emit("END_CHAT", true);

    // clear user data from the obj
    if (users[0] in connectUsers) {
      delete connectUsers[users[0]];
    }

    if (users[1] in connectUsers) {
      delete connectUsers[users[1]];
    }

    console.log("connectUsers: ", connectUsers);

    res.status(200).json({ status: "END_CHAT" });
  }

  /** ----------------------
   *ON TYPING ALERT
   * ---------------------*/
  if (operationType === "TYPING_ALERT") {
    const users = reqData.users as string[];
    const isFocus = reqData.isFocus;
    userAddress;
    let toSendAddress: any = users.filter((address) => address !== userAddress);
    toSendAddress = toSendAddress[0];
    global.io.to(toSendAddress as string).emit("TYPING_ALERT", isFocus);
    // users[1] && global.io.to(users[1]).emit("END_CHAT", true);

    res.status(200).json({ status: "TYPING_ALERT" });
  }

  if (operationType === "MSG_INCOMING_ALERT") {
    const users = reqData.users as string[];
    const isFocus = reqData.isFocus;
    userAddress;
    let toSendAddress: any = users.filter((address) => address !== userAddress);
    toSendAddress = toSendAddress[0];
    global.io.to(toSendAddress as string).emit("MSG_INCOMING_ALERT", isFocus);
    // users[1] && global.io.to(users[1]).emit("END_CHAT", true);

    res.status(200).json({ status: "MSG_INCOMING_ALERT" });
  }

  //     res.status(200).json({ status: "cool man" });
});

export default router;
