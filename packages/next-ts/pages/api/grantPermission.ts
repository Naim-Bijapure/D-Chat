// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import ERC725 from "@erc725/erc725.js";
import { ethers, Signer } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import Web3 from "web3";

import account from "../../contracts/account.json";

// const RPC_URL = "http://0.0.0.0:8545"; // local url
// const UP_ADDRESS = "0xcd49A709B9604Bc255A7e0Ef02735c265318a0DF";
// const VAULT_ADDRESS = "0x7944657574a5A22E2638B10fB638FfC5FcaE5b3D";
// const RPC_URL = "https://rpc.l16.lukso.network";

// type Data = {
//   data: number[];
// };

// const web3provider = new Web3.providers.HttpProvider(RPC_URL);
// const provider = new ethers.providers.StaticJsonRpcProvider(RPC_URL);
// const walletSigner = new ethers.Wallet(account.privateKey, provider); // <---- custom signer from EOA account

// reading global values
const UP_ADDRESS = global.UP_ADDRESS;
const VAULT_ADDRESS = global.VAULT_ADDRESS;
const UP: ethers.Contract = global.UP;
const KM: ethers.Contract = global.KM;
const erc725: ERC725 = global.erc725;
const walletSigner: Signer = global.walletSigner;

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

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>): Promise<any> {
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
