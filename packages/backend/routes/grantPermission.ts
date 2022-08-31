import ERC725 from "@erc725/erc725.js";
import { ethers, Signer } from "ethers";
import { Router } from "express";
import { UP_ADDRESS, VAULT_ADDRESS } from "../constants";

const router = Router();

async function grantPersmission(address): Promise<boolean> {
  const UP: ethers.Contract = global.UP;
  const KM: ethers.Contract = global.KM;
  const erc725: ERC725 = global.erc725;
  const walletSigner: Signer = global.walletSigner;

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

    // encode the data key-value pairs of the permissions to be set
    const data = erc725?.encodeData({
      // @ts-ignore
      keyName: "AddressPermissions:Permissions:<address>",
      dynamicKeyParts: beneficiaryAddress,
      value: beneficiaryPermissions,
    });

    // console.log("data: ", data);

    const payload = UP.interface.encodeFunctionData("setData(bytes32,bytes)", [
      data.keys[0],
      data.values[0],
    ]);

    // send the transaction via the Key Manager contract
    const tx = await KM.connect(walletSigner).execute(payload, {
      gasLimit: 10000000,
    }); // <---- call the execute on key manager contract
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

    const allowedAddressDataPayload = UP.interface.encodeFunctionData(
      "setData(bytes32[],bytes[])",
      [allowedAddressData?.keys, allowedAddressData?.values]
    );

    const tx1 = await KM.connect(walletSigner).execute(
      allowedAddressDataPayload,
      { gasLimit: 10000000 }
    ); // <---- call the execute on key manager contract
    const rcpt1 = await tx1.wait();

    return true;
  } catch (error) {
    console.log("error: ", error);
    return false;
  }
}

// define the home page route
router.get("/", async (req, res) => {
  const address = req.query.address;

  const UP: ethers.Contract = global.UP;
  const KM: ethers.Contract = global.KM;
  const erc725: ERC725 = global.erc725;

  let response: boolean = false;

  if (UP && erc725) {
    response = await grantPersmission(address);
  }

  res.status(200).json({
    UP_ADDRESS,
    VAULT_ADDRESS,
    address,
    msg: response
      ? "permission granted successfully"
      : "error in granting permission",
  });
});

export default router;
