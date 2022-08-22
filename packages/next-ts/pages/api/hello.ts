// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { NextApiResponseWithSocket } from "../../types";

type Data = {
  name: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket): any {
  console.log("global.data: ", global.data);
  // console.log("res: ", res.socket.server);
  // res.socket.server.io.to("0x0fAb64624733a7020D332203568754EB1a37DB89").emit("roomData", "only for user 1 room");
  res.status(200).json({ name: "John Doe" });
}
