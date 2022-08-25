// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { NextApiResponseWithSocket } from "../../types";
import { cipher, createIdentity, decryptWithPrivateKey, encryptWithPublicKey, publicKeyByPrivateKey } from "eth-crypto";
import account from "../../contracts/account.json";

type Data = {
  name: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket): any {
  // console.log("global.data: ", global.data);
  // console.log("res: ", res.socket.server);
  // res.socket.server.io.to("0x0fAb64624733a7020D332203568754EB1a37DB89").emit("roomData", "only for user 1 room");
  // const identity = createIdentity();
  // console.log("identity: ", identity);
  const publicKey = publicKeyByPrivateKey(account.privateKey);

  console.log("publicKey: ", publicKey);
  const encrypted = await encryptWithPublicKey(
    publicKey, // publicKey
    "foobar" // message
  );

  console.log("encrypted: ", encrypted);

  const message = await decryptWithPrivateKey(
    account.privateKey, // privateKey
    encrypted
  );

  console.log("message: ", message);

  const str = cipher.stringify({
    ...encrypted,
  });

  console.log("str: ", str);
  const parsed = cipher.parse(str);
  console.log("parsed: ", parsed);

  res.status(200).json({ name: "John Doe" });
}
