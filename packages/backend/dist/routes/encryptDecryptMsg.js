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
exports.__esModule = true;
var express_1 = require("express");
var eth_crypto_1 = require("eth-crypto");
// import account from "../account.json";
var router = (0, express_1.Router)();
// define the home page route
router.post("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var reqData, data, encrypted, encryptedData, encryptedData, messagesData, parsed, decryptedData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                reqData = req.body;
                if (!(reqData.type === "ENCRYPT")) return [3 /*break*/, 2];
                data = __assign({}, reqData.msgData);
                return [4 /*yield*/, (0, eth_crypto_1.encryptWithPublicKey)(global.publicKey, // publicKey
                    JSON.stringify(data) // message
                    )];
            case 1:
                encrypted = _a.sent();
                encryptedData = eth_crypto_1.cipher.stringify(__assign({}, encrypted));
                return [2 /*return*/, res.status(200).json({ encryptedData: encryptedData })];
            case 2:
                if (!(reqData.type === "DECRYPT")) return [3 /*break*/, 9];
                encryptedData = reqData.encryptedData;
                _a.label = 3;
            case 3:
                _a.trys.push([3, 8, , 9]);
                if (!Array.isArray(encryptedData)) return [3 /*break*/, 5];
                return [4 /*yield*/, Promise.all(encryptedData.map(function (encryptedMsg) { return __awaiter(void 0, void 0, void 0, function () {
                        var parsed, decryptedData, finalParsedData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(encryptedMsg !== "")) return [3 /*break*/, 2];
                                    parsed = eth_crypto_1.cipher.parse(encryptedMsg);
                                    return [4 /*yield*/, (0, eth_crypto_1.decryptWithPrivateKey)(process.env.ACCOUNT_PRIVATE_KEY, // privateKey
                                        parsed)];
                                case 1:
                                    decryptedData = _a.sent();
                                    finalParsedData = JSON.parse(decryptedData);
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                                    return [2 /*return*/, finalParsedData];
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 4:
                messagesData = _a.sent();
                return [2 /*return*/, res.status(200).json({ messagesData: messagesData })];
            case 5:
                parsed = eth_crypto_1.cipher.parse(encryptedData);
                return [4 /*yield*/, (0, eth_crypto_1.decryptWithPrivateKey)(process.env.ACCOUNT_PRIVATE_KEY, // privateKey
                    parsed)];
            case 6:
                decryptedData = _a.sent();
                return [2 /*return*/, res.status(200).json({ decryptedData: JSON.parse(decryptedData) })];
            case 7: return [3 /*break*/, 9];
            case 8:
                error_1 = _a.sent();
                //       console.log("error: ", error);
                return [2 /*return*/, res.status(200).json({ msg: "not a valid encrypted data" })];
            case 9: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
