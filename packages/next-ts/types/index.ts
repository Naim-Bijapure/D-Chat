import { NextApiResponse } from "next";
import { Server } from "socket.io";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: { server: { io: Server } };
};

export type connectUsersType = Record<
  string,
  { interests: string[]; users?: string[]; dynamicKey?: string; status?: string }
>;

export type connectUserReponseType = {
  users?: string[];
  dynamicKey?: string;
  status?: string;
};
