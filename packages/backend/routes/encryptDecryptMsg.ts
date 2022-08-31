import { Router } from "express";

import {
    cipher,
    decryptWithPrivateKey,
    encryptWithPublicKey
} from "eth-crypto";
// import account from "../account.json";

const router = Router();

// define the home page route
router.post("/", async (req, res) => {
  const reqData = req.body;

  //   on encrypt a message
  if (reqData.type === "ENCRYPT") {
    const data = {
      ...reqData.msgData,
    };
    const encrypted = await encryptWithPublicKey(
      global.publicKey as string, // publicKey
      JSON.stringify(data) // message
    );

    const encryptedData = cipher.stringify({
      ...encrypted,
    });

    return res.status(200).json({ encryptedData });
  }

  //   on decrypt messages
  if (reqData.type === "DECRYPT") {
    const encryptedData = reqData.encryptedData;
    try {
      if (Array.isArray(encryptedData)) {
        const messagesData = await Promise.all(
          encryptedData.map(async (encryptedMsg): Promise<any> => {
            if (encryptedMsg !== "") {
              const parsed = cipher.parse(encryptedMsg as string);

              //     DECRYPTED MESSAGES
              const decryptedData = await decryptWithPrivateKey(
                process.env.ACCOUNT_PRIVATE_KEY, // privateKey
                parsed
              );
              const finalParsedData = JSON.parse(decryptedData);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return finalParsedData;
            }
          })
        );

        return res.status(200).json({ messagesData });
      } else {
        const parsed = cipher.parse(encryptedData as string);
        //     decrypted messages
        const decryptedData = await decryptWithPrivateKey(
          process.env.ACCOUNT_PRIVATE_KEY, // privateKey
          parsed
        );

        return res
          .status(200)
          .json({ decryptedData: JSON.parse(decryptedData) });
      }
    } catch (error) {
      //       console.log("error: ", error);

      return res.status(200).json({ msg: "not a valid encrypted data" });
    }
  }
});

export default router;
