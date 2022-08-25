/* eslint-disable @typescript-eslint/no-unsafe-argument */

import ERC725 from "@erc725/erc725.js";
import LSP10ReceivedVaults from "@erc725/erc725.js/schemas/LSP10ReceivedVaults.json";
import erc725schema from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json";
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import LSP9Vault from "@erc725/erc725.js/schemas/LSP9Vault.json";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import { ethers } from "ethers";
import { NextApiRequest } from "next";
import { Server } from "socket.io";
import Web3 from "web3";
import { cipher, decryptWithPrivateKey, encryptWithPublicKey, publicKeyByPrivateKey } from "eth-crypto";

import account from "../../contracts/account.json";
import { Vault__factory } from "../../contracts/contract-types";
import { NextApiResponseWithSocket } from "../../types";

const UP_ADDRESS = "0xcd49A709B9604Bc255A7e0Ef02735c265318a0DF";
const VAULT_ADDRESS = "0x7944657574a5A22E2638B10fB638FfC5FcaE5b3D";
const RPC_URL = "http://0.0.0.0:8545"; // local url

const web3provider = new Web3.providers.HttpProvider(RPC_URL);
const provider = new ethers.providers.StaticJsonRpcProvider(RPC_URL);
const walletSigner = new ethers.Wallet(account.privateKey, provider); // <---- custom signer from EOA account

global.RPC_URL = RPC_URL;
global.VAULT_ADDRESS = VAULT_ADDRESS;
global.UP_ADDRESS = UP_ADDRESS;
global.walletSigner = walletSigner;

// let UP: ethers.Contract, KM: ethers.Contract, VAULT: ethers.Contract, erc725: ERC725;

// const myString = {
//   name: "String",
//   key: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("String")),
//   keyType: "Singleton",
//   valueType: "string",
//   valueContent: "String",
// };

// const myStringArr = {
//   name: "String[]",
//   key: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("String[]")),
//   keyType: "Array",
//   valueType: "string",
//   valueContent: "String",
// };

// erc725schema.push(myString);
// erc725schema.push(myStringArr);

async function LoadContracts(): Promise<void> {
  // load UP contract
  global.UP = new ethers.Contract(UP_ADDRESS, UniversalProfile.abi, walletSigner); // <---- create UP contract instance from address
  const upOwner = await global.UP?.owner(); // <---- get owner of UP contract
  console.log("UP: ", global.UP.address);

  // load KM contract
  global.KM = new ethers.Contract(upOwner as string, KeyManager.abi, walletSigner); // <---- get key manager from UP contract
  console.log("KM:address ", global.KM.address);

  // load Vault contract
  global.VAULT = new ethers.Contract(VAULT_ADDRESS, Vault__factory.abi, walletSigner); // <---- get key manager from UP contract
  console.log("VAULT:address", global.VAULT.address);
  console.log("VAULT:owner", await global.VAULT?.owner());

  global.erc725 = new ERC725(
    // @ts-ignore
    [...erc725schema, ...LSP6Schema, ...LSP10ReceivedVaults, ...LSP9Vault],
    UP_ADDRESS,
    web3provider
  );
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket): any {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    // @ts-ignore
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    global.publicKey = publicKeyByPrivateKey(account.privateKey);

    res.socket.server.io.on("connect", (socket) => {
      console.log("socket:connected ");
      void LoadContracts();

      socket.on("createRoom", async (room) => {
        console.log("socket:on creating room ");
        await socket.join(room);
        console.log("socket:joined room ", room);
      });
    });
  }
  res.end();
}
