import cors from "cors";
import express from "express";
// import moment from "moment";
import http from "http";

import ERC725 from "@erc725/erc725.js";
import LSP10ReceivedVaults from "@erc725/erc725.js/schemas/LSP10ReceivedVaults.json";
import erc725schema from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json";
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import LSP9Vault from "@erc725/erc725.js/schemas/LSP9Vault.json";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import { publicKeyByPrivateKey } from "eth-crypto";
import { ethers } from "ethers";
import Web3 from "web3";
import account from "./account.json";
import { RPC_URL, UP_ADDRESS, VAULT_ADDRESS } from "./constants";
import connectUser from "./routes/connectUser";
import encryptDecryptMsg from "./routes/encryptDecryptMsg";
import grantPermission from "./routes/grantPermission";
import vault from "./vault.json";

const web3provider = new Web3.providers.HttpProvider(RPC_URL);
const provider = new ethers.providers.StaticJsonRpcProvider(RPC_URL);
const walletSigner = new ethers.Wallet(account.privateKey, provider); // <---- custom signer from EOA account

global.RPC_URL = RPC_URL;
global.VAULT_ADDRESS = VAULT_ADDRESS;
global.UP_ADDRESS = UP_ADDRESS;
global.walletSigner = walletSigner;
const port: any = Number(process.env.PORT) || 4000;

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

global.io = io;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function LoadContracts(): Promise<void> {
  // load UP contract
  global.UP = new ethers.Contract(
    UP_ADDRESS,
    UniversalProfile.abi,
    walletSigner
  ); // <---- create UP contract instance from address
  const upOwner = await global.UP?.owner(); // <---- get owner of UP contract
  console.log("UP: ", global.UP.address);

  // load KM contract
  global.KM = new ethers.Contract(
    upOwner as string,
    KeyManager.abi,
    walletSigner
  ); // <---- get key manager from UP contract
  console.log("KM:address ", global.KM.address);

  // load Vault contract
  global.VAULT = new ethers.Contract(VAULT_ADDRESS, vault.abi, walletSigner); // <---- get key manager from UP contract
  console.log("VAULT:address", global.VAULT.address);
  console.log("VAULT:owner", await global.VAULT?.owner());

  global.erc725 = new ERC725(
    // @ts-ignore
    [...erc725schema, ...LSP6Schema, ...LSP10ReceivedVaults, ...LSP9Vault],
    UP_ADDRESS,
    web3provider
  );

  global.publicKey = publicKeyByPrivateKey(account.privateKey);
}

// socket.io
io.on("connection", (socket) => {
  console.log("socket: connect ");
  // create a room event
  socket.on("createRoom", async (room) => {
    console.log("socket:on creating room ");
    await socket.join(room);
    console.log("socket:joined room ", room);
  });
});

app.get("/test", async (req, res) => {
  return res.json({ status: "server is up" });
});

app.get("/", async (req, res) => {
  await LoadContracts();
  return res.json({ status: "contracts loaded" });
});

app.use("/api/grantPermission", grantPermission);
app.use("/api/connectUser", connectUser);
app.use("/api/encryptDecryptMsg", encryptDecryptMsg);

server.listen(port, "0.0.0.0", () => {
  console.log(` application is running on port ${port}.`);
});

// // to keep alive heroku call test api every 5 minutes
setInterval(function () {
  const https = require("https");

  const options = {
    hostname: "domagle-backend.herokuapp.com",
    path: "/test",
    method: "GET",
  };
  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });
  req.on("error", (error) => {
    console.error(error);
  });

  req.end();
}, 300000); // every 5 minutes (300000)
