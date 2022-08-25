// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import ERC725 from "@erc725/erc725.js";
import LSP10ReceivedVaults from "@erc725/erc725.js/schemas/LSP10ReceivedVaults.json";
import erc725schema from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json";
import LSP6Schema from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import LSP9Vault from "@erc725/erc725.js/schemas/LSP9Vault.json";
import KeyManager from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import UniversalProfile from "@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import Web3 from "web3";

import account from "../../contracts/account.json";
import { Vault__factory } from "../../contracts/contract-types";

const UP_ADDRESS = "0x0fd3D152D8Db789549cfF31D825f6335Db4b271E";
const VAULT_ADDRESS = "0x4db6D4ff7eB17a23Ca5Cd475561d6d622c806EF1";
const RPC_URL = "https://rpc.l16.lukso.network";

// type Data = {
//   data: number[];
// };

const web3provider = new Web3.providers.HttpProvider(RPC_URL);
const provider = new ethers.providers.StaticJsonRpcProvider(RPC_URL);
const walletSigner = new ethers.Wallet(account.privateKey, provider); // <---- custom signer from EOA account

let UP: ethers.Contract, KM: ethers.Contract, VAULT: ethers.Contract, erc725: ERC725;

const myString = {
  name: "String",
  key: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("String")),
  keyType: "Singleton",
  valueType: "string",
  valueContent: "String",
};

const myStringArr = {
  name: "String[]",
  key: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("String[]")),
  keyType: "Array",
  valueType: "string",
  valueContent: "String",
};

erc725schema.push(myString);
erc725schema.push(myStringArr);

async function LoadContracts(): Promise<void> {
  // load UP contract
  UP = new ethers.Contract(UP_ADDRESS, UniversalProfile.abi, walletSigner); // <---- create UP contract instance from address
  const upOwner = await UP?.owner(); // <---- get owner of UP contract
  console.log("UP: ", UP.address);

  // load KM contract
  KM = new ethers.Contract(upOwner as string, KeyManager.abi, walletSigner); // <---- get key manager from UP contract
  console.log("KM:address ", KM.address);

  // load Vault contract
  VAULT = new ethers.Contract(VAULT_ADDRESS, Vault__factory.abi, walletSigner); // <---- get key manager from UP contract
  console.log("VAULT:address", VAULT.address);
  console.log("VAULT:owner", await VAULT?.owner());

  erc725 = new ERC725(
    // @ts-ignore
    [...erc725schema, ...LSP6Schema, ...LSP10ReceivedVaults, ...LSP9Vault],
    UP_ADDRESS,
    web3provider
  );
}

async function grantPersmission(address): Promise<boolean> {
  try {
    /** ----------------------
     * set the call permission
     * ---------------------*/
    const beneficiaryAddress = address; // EOA address of an exemplary person
    const beneficiaryPermissions = erc725?.encodePermissions({
      // ADDPERMISSIONS: true,
      CALL: true,
      // CHANGEOWNER: true,
      // CHANGEPERMISSIONS: true,
      // DELEGATECALL: true,
      // DEPLOY: true,
      // SETDATA: true,
      // SIGN: true,
      // STATICCALL: true,
      // SUPER_CALL: true,
      // SUPER_DELEGATECALL: true,
      // SUPER_SETDATA: true,
      // SUPER_STATICCALL: true,
      // SUPER_TRANSFERVALUE: true,
      // TRANSFERVALUE: true,
    });

    // step 3.1 - encode the data key-value pairs of the permissions to be set
    const data = erc725?.encodeData({
      // @ts-ignore
      keyName: "AddressPermissions:Permissions:<address>",
      dynamicKeyParts: beneficiaryAddress,
      value: beneficiaryPermissions,
    });

    // console.log("data: ", data);

    const payload = UP.interface.encodeFunctionData("setData(bytes32,bytes)", [data.keys[0], data.values[0]]);

    // step 4 - send the transaction via the Key Manager contract
    const tx = await KM.connect(walletSigner).execute(payload, { gasLimit: 10000000 }); // <---- call the execute on key manager contract
    const rcpt = await tx.wait();

    /** ----------------------
     * add allowed address
     * ---------------------*/
    const allowedAddressData = erc725?.encodeData({
      // @ts-ignore
      keyName: "AddressPermissions:AllowedAddresses:<address>",
      dynamicKeyParts: address,
      value: [VAULT_ADDRESS],
    });

    // console.log("allowedAddressData: ", allowedAddressData);

    const allowedAddressDataPayload = UP.interface.encodeFunctionData("setData(bytes32[],bytes[])", [
      allowedAddressData?.keys,
      allowedAddressData?.values,
    ]);

    const tx1 = await KM.connect(walletSigner).execute(allowedAddressDataPayload, { gasLimit: 10000000 }); // <---- call the execute on key manager contract
    const rcpt1 = await tx1.wait();

    // const result1 = await UP["getData(bytes32)"](allowedAddressData?.keys[0]);
    // console.log("result1: ", result1);
    return true;
  } catch (error) {
    console.log("error: ", error);
    return false;
  }
}

// loading all contracts at first time
void LoadContracts();
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>): Promise<any> {
  await LoadContracts();
  const address = req.query.address;

  let response: boolean = false;
  if (UP && erc725) {
    response = await grantPersmission(address);
  }

  res.status(200).json({
    UP_ADDRESS,
    VAULT_ADDRESS,
    address,
    msg: response ? "permission granted successfully" : "error in granting permission",
  });
}
