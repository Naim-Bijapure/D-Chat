"use strict";
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
var constants_1 = require("../constants");
var router = (0, express_1.Router)();
function grantPersmission(address) {
    return __awaiter(this, void 0, void 0, function () {
        var UP, KM, erc725, walletSigner, beneficiaryAddress, beneficiaryPermissions, data, payload, tx, rcpt, allowedAddressData, allowedAddressDataPayload, tx1, rcpt1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    UP = global.UP;
                    KM = global.KM;
                    erc725 = global.erc725;
                    walletSigner = global.walletSigner;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    beneficiaryAddress = address;
                    beneficiaryPermissions = erc725 === null || erc725 === void 0 ? void 0 : erc725.encodePermissions({
                        // ADDPERMISSIONS: true,
                        CALL: true
                    });
                    data = erc725 === null || erc725 === void 0 ? void 0 : erc725.encodeData({
                        // @ts-ignore
                        keyName: "AddressPermissions:Permissions:<address>",
                        dynamicKeyParts: beneficiaryAddress,
                        value: beneficiaryPermissions
                    });
                    payload = UP.interface.encodeFunctionData("setData(bytes32,bytes)", [data.keys[0], data.values[0]]);
                    return [4 /*yield*/, KM.connect(walletSigner).execute(payload, { gasLimit: 10000000 })];
                case 2:
                    tx = _a.sent();
                    return [4 /*yield*/, tx.wait()];
                case 3:
                    rcpt = _a.sent();
                    allowedAddressData = erc725 === null || erc725 === void 0 ? void 0 : erc725.encodeData({
                        // @ts-ignore
                        keyName: "AddressPermissions:AllowedAddresses:<address>",
                        dynamicKeyParts: address,
                        value: [constants_1.VAULT_ADDRESS]
                    });
                    allowedAddressDataPayload = UP.interface.encodeFunctionData("setData(bytes32[],bytes[])", [
                        allowedAddressData === null || allowedAddressData === void 0 ? void 0 : allowedAddressData.keys,
                        allowedAddressData === null || allowedAddressData === void 0 ? void 0 : allowedAddressData.values,
                    ]);
                    return [4 /*yield*/, KM.connect(walletSigner).execute(allowedAddressDataPayload, { gasLimit: 10000000 })];
                case 4:
                    tx1 = _a.sent();
                    return [4 /*yield*/, tx1.wait()];
                case 5:
                    rcpt1 = _a.sent();
                    return [2 /*return*/, true];
                case 6:
                    error_1 = _a.sent();
                    console.log("error: ", error_1);
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// define the home page route
router.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var address, UP, KM, erc725, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                address = req.query.address;
                UP = global.UP;
                KM = global.KM;
                erc725 = global.erc725;
                response = false;
                if (!(UP && erc725)) return [3 /*break*/, 2];
                return [4 /*yield*/, grantPersmission(address)];
            case 1:
                response = _a.sent();
                _a.label = 2;
            case 2:
                res.status(200).json({
                    UP_ADDRESS: constants_1.UP_ADDRESS,
                    VAULT_ADDRESS: constants_1.VAULT_ADDRESS,
                    address: address,
                    msg: response ? "permission granted successfully" : "error in granting permission"
                });
                return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
