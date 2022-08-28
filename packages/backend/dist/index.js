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
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
// import moment from "moment";
var http_1 = __importDefault(require("http"));
var erc725_js_1 = __importDefault(require("@erc725/erc725.js"));
var LSP10ReceivedVaults_json_1 = __importDefault(require("@erc725/erc725.js/schemas/LSP10ReceivedVaults.json"));
var LSP3UniversalProfileMetadata_json_1 = __importDefault(require("@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json"));
var LSP6KeyManager_json_1 = __importDefault(require("@erc725/erc725.js/schemas/LSP6KeyManager.json"));
var LSP9Vault_json_1 = __importDefault(require("@erc725/erc725.js/schemas/LSP9Vault.json"));
var LSP6KeyManager_json_2 = __importDefault(require("@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json"));
var UniversalProfile_json_1 = __importDefault(require("@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json"));
var ethers_1 = require("ethers");
var web3_1 = __importDefault(require("web3"));
var account_json_1 = __importDefault(require("./account.json"));
var vault_json_1 = __importDefault(require("./vault.json"));
var grantPermission_1 = __importDefault(require("./routes/grantPermission"));
var constants_1 = require("./constants");
var connectUser_1 = __importDefault(require("./routes/connectUser"));
var encryptDecryptMsg_1 = __importDefault(require("./routes/encryptDecryptMsg"));
var web3provider = new web3_1["default"].providers.HttpProvider(constants_1.RPC_URL);
var provider = new ethers_1.ethers.providers.StaticJsonRpcProvider(constants_1.RPC_URL);
var walletSigner = new ethers_1.ethers.Wallet(account_json_1["default"].privateKey, provider); // <---- custom signer from EOA account
global.RPC_URL = constants_1.RPC_URL;
global.VAULT_ADDRESS = constants_1.VAULT_ADDRESS;
global.UP_ADDRESS = constants_1.UP_ADDRESS;
global.walletSigner = walletSigner;
var port = Number(process.env.PORT) || 4000;
var app = (0, express_1["default"])();
var server = http_1["default"].createServer(app);
var io = require("socket.io")(server, {
    cors: {
        origin: "*"
    }
});
global.io = io;
app.use((0, cors_1["default"])({ origin: "*" }));
app.use(express_1["default"].json());
app.use(express_1["default"].urlencoded({ extended: true }));
function LoadContracts() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var upOwner, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    // load UP contract
                    global.UP = new ethers_1.ethers.Contract(constants_1.UP_ADDRESS, UniversalProfile_json_1["default"].abi, walletSigner); // <---- create UP contract instance from address
                    return [4 /*yield*/, ((_a = global.UP) === null || _a === void 0 ? void 0 : _a.owner())];
                case 1:
                    upOwner = _f.sent();
                    console.log("UP: ", global.UP.address);
                    // load KM contract
                    global.KM = new ethers_1.ethers.Contract(upOwner, LSP6KeyManager_json_2["default"].abi, walletSigner); // <---- get key manager from UP contract
                    console.log("KM:address ", global.KM.address);
                    // load Vault contract
                    global.VAULT = new ethers_1.ethers.Contract(constants_1.VAULT_ADDRESS, vault_json_1["default"].abi, walletSigner); // <---- get key manager from UP contract
                    console.log("VAULT:address", global.VAULT.address);
                    _d = (_c = console).log;
                    _e = ["VAULT:owner"];
                    return [4 /*yield*/, ((_b = global.VAULT) === null || _b === void 0 ? void 0 : _b.owner())];
                case 2:
                    _d.apply(_c, _e.concat([_f.sent()]));
                    global.erc725 = new erc725_js_1["default"](__spreadArray(__spreadArray(__spreadArray(__spreadArray([], LSP3UniversalProfileMetadata_json_1["default"], true), LSP6KeyManager_json_1["default"], true), LSP10ReceivedVaults_json_1["default"], true), LSP9Vault_json_1["default"], true), constants_1.UP_ADDRESS, web3provider);
                    return [2 /*return*/];
            }
        });
    });
}
// socket.io
io.on("connection", function (socket) {
    console.log("socket: connect ");
    // create a room event
    socket.on("createRoom", function (room) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("socket:on creating room ");
                    return [4 /*yield*/, socket.join(room)];
                case 1:
                    _a.sent();
                    console.log("socket:joined room ", room);
                    return [2 /*return*/];
            }
        });
    }); });
});
app.get("/test", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, res.json({ status: "server is up" })];
    });
}); });
app.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, LoadContracts()];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ status: "contracts loaded" })];
        }
    });
}); });
app.use("/api/grantPermission", grantPermission_1["default"]);
app.use("/api/connectUser", connectUser_1["default"]);
app.use("/api/encryptDecryptMsg", encryptDecryptMsg_1["default"]);
server.listen(port, "0.0.0.0", function () {
    console.log(" application is running on port ".concat(port, "."));
});
// // to keep alive heroku call test api every 5 minutes
setInterval(function () {
    var https = require("https");
    var options = {
        hostname: "https://domagle-backend.herokuapp.com",
        path: "/test",
        method: "GET"
    };
    var req = https.request(options, function (res) {
        console.log("statusCode: ".concat(res.statusCode));
        res.on("data", function (d) {
            process.stdout.write(d);
        });
    });
    req.on("error", function (error) {
        console.error(error);
    });
    req.end();
}, 300000); // every 5 minutes (300000)
