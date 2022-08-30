"use strict";
// local up and vault address
// export const UP_ADDRESS = "0xFE8e2Ab85F235c7399AebD2De11786905996ED00";
// export const VAULT_ADDRESS = "0xe4F0d79c1af1310C88e9A2dcd2841291c2a6cC9B";
// export const RPC_URL = "http://0.0.0.0:8545"; // local url
exports.__esModule = true;
exports.KEY_NAME = exports.RPC_URL = exports.VAULT_ADDRESS = exports.UP_ADDRESS = void 0;
// on lukso up and vault addresses
exports.UP_ADDRESS = process.env.UP_ADDRESS;
exports.VAULT_ADDRESS = process.env.VAULT_ADDRESS;
exports.RPC_URL = "https://rpc.l16.lukso.network";
// export const UP_ADDRESS = "0xbC5b0A53cEAB1C38a93e5C58333b13e741B68b42";
// export const VAULT_ADDRESS = "0xe4F0d79c1af1310C88e9A2dcd2841291c2a6cC9B";
exports.KEY_NAME = "chat:<string>:<string>";
