/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { NextApiRequest } from "next";
import { Server } from "socket.io";

import { connectUsersType, NextApiResponseWithSocket } from "../../types";

const connectUsers: connectUsersType = global.connectUsers;

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket): any {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    // @ts-ignore
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    res.socket.server.io.on("connect", (socket) => {
      console.log("socket:connected ");

      socket.on("createRoom", async (room) => {
        console.log("socket:on creating room ");
        await socket.join(room);
        console.log("socket:joined room ", room);
      });
    });

    // setInterval(() => {
    //   console.log("setInterval");
    //   for (const addressKey in global.connectUsers) {
    //     console.log("addressKey: ", addressKey);
    //     const userData = global.connectUsers[addressKey];
    //     console.log("userData: ", userData);
    //     if (userData.status === "MATCH") {
    //       io.to(userData.users![0]).emit("roomData", userData);
    //       io.to(userData.users![1]).emit("roomData", userData);
    //     }
    //   }
    // }, 2000);
  }
  res.end();
}
