// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import ERC725 from "@erc725/erc725.js";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  chatUsers: string[];
  dynamicKey: string;
};

const KEY_NAME = "chat:<string>:<string>";

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>): any {
  const chatUsers = ["0x0fAb64624733a7020D332203568754EB1a37DB89", "0x147E6330A5cd8a7fd3ae27fF88f76ba987169670"].sort();

  const dynamicKey = ERC725.encodeKeyName(KEY_NAME, [...chatUsers]);

  res.status(200).json({
    chatUsers,
    dynamicKey,
  });
}
