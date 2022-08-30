"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var erc725_js_1 = __importDefault(require("@erc725/erc725.js"));
var express_1 = require("express");
var constants_1 = require("../constants");
var router = (0, express_1.Router)();
var connectUsers = {};
router.post("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var reqData, userAddress, toAddress, operationType, matchedAdress, addresses, dynamicKey, userData, interests_1, isInterestMatching, matchedAdress, addressKey, userData, addresses, dynamicKey, userData, users, users, isFocus, toSendAddress, users, isFocus, toSendAddress;
    return __generator(this, function (_a) {
        reqData = req.body;
        userAddress = reqData.address;
        toAddress = reqData.toAddress;
        operationType = reqData.operationType;
        console.log("reqData: ", reqData);
        /** ----------------------
         * ON DIRECT CHAT
         * ---------------------*/
        if (operationType === "directChat") {
            matchedAdress = "0x";
            connectUsers[userAddress] = {
                status: "NO_MATCH"
            };
            addresses = [toAddress, userAddress].sort();
            connectUsers[userAddress].users = addresses;
            matchedAdress = userAddress;
            dynamicKey = erc725_js_1["default"].encodeKeyName(constants_1.KEY_NAME, __spreadArray([], addresses, true));
            connectUsers[userAddress].dynamicKey = dynamicKey;
            connectUsers[userAddress].status = "MATCH";
            if (connectUsers[matchedAdress]) {
                userData = connectUsers[matchedAdress];
                console.log("userData: ", userData);
                global.io.to(userData.users[0]).emit("MATCH", userData);
                global.io.to(userData.users[1]).emit("MATCH", userData);
                // emit the connected data
                return [2 /*return*/, res.status(200).json(__assign({}, connectUsers[matchedAdress]))];
            }
            if (connectUsers[matchedAdress] === undefined) {
                return [2 /*return*/, res.status(200).json(__assign({}, connectUsers[userAddress]))];
            }
        }
        /** ----------------------
         * ON FIND USER
         * ---------------------*/
        if (operationType === "findUser") {
            interests_1 = reqData.interests;
            isInterestMatching = false;
            matchedAdress = "0x";
            // find any exissting match
            for (addressKey in connectUsers) {
                if (addressKey !== userAddress) {
                    userData = connectUsers[addressKey];
                    isInterestMatching = userData.interests.some(function (interest) {
                        return interests_1.includes(interest);
                    });
                    if (isInterestMatching) {
                        addresses = [addressKey, userAddress].sort();
                        connectUsers[addressKey].users = addresses;
                        matchedAdress = addressKey;
                        dynamicKey = erc725_js_1["default"].encodeKeyName(constants_1.KEY_NAME, __spreadArray([], addresses, true));
                        connectUsers[addressKey].dynamicKey = dynamicKey;
                        connectUsers[addressKey].status = "MATCH";
                        break;
                    }
                }
            }
            // if no intereset matching then create a new entry
            if (userAddress in connectUsers === false && isInterestMatching === false) {
                connectUsers[userAddress] = {
                    interests: interests_1,
                    status: "NO_MATCH"
                };
            }
            // global.connectUsers = connectUsers;
            if (connectUsers[matchedAdress]) {
                userData = connectUsers[matchedAdress];
                console.log("userData:MATCH ", userData);
                console.log("userData.users![0]: ", userData.users[0]);
                console.log("userData.users![1]: ", userData.users[1]);
                global.io.to(userData.users[0]).emit("MATCH", userData);
                global.io.to(userData.users[1]).emit("MATCH", userData);
                // emit the connected data
                return [2 /*return*/, res.status(200).json(__assign({}, connectUsers[matchedAdress]))];
            }
            if (connectUsers[matchedAdress] === undefined) {
                // console.log("connectUsers[userAddress]: ", connectUsers[userAddress]);
                return [2 /*return*/, res.status(200).json(__assign({}, connectUsers[userAddress]))];
            }
        }
        /** ----------------------
         * ON CLEAR USER CHAT DATA
         * ---------------------*/
        if (operationType === "END_CHAT") {
            users = reqData.users;
            console.log("users: ", users);
            global.io.to(users[0]).emit("END_CHAT", true);
            users[1] && global.io.to(users[1]).emit("END_CHAT", true);
            // clear user data from the obj
            if (users[0] in connectUsers) {
                delete connectUsers[users[0]];
            }
            if (users[1] in connectUsers) {
                delete connectUsers[users[1]];
            }
            console.log("connectUsers: ", connectUsers);
            res.status(200).json({ status: "END_CHAT" });
        }
        /** ----------------------
         *ON TYPING ALERT
         * ---------------------*/
        if (operationType === "TYPING_ALERT") {
            users = reqData.users;
            isFocus = reqData.isFocus;
            userAddress;
            toSendAddress = users.filter(function (address) { return address !== userAddress; });
            toSendAddress = toSendAddress[0];
            global.io.to(toSendAddress).emit("TYPING_ALERT", isFocus);
            // users[1] && global.io.to(users[1]).emit("END_CHAT", true);
            res.status(200).json({ status: "TYPING_ALERT" });
        }
        if (operationType === "MSG_INCOMING_ALERT") {
            users = reqData.users;
            isFocus = reqData.isFocus;
            userAddress;
            toSendAddress = users.filter(function (address) { return address !== userAddress; });
            toSendAddress = toSendAddress[0];
            global.io.to(toSendAddress).emit("MSG_INCOMING_ALERT", isFocus);
            // users[1] && global.io.to(users[1]).emit("END_CHAT", true);
            res.status(200).json({ status: "MSG_INCOMING_ALERT" });
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
