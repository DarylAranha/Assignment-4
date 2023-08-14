"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
let localURI = config_1.default.LOCAL_DB;
let remoteURI = config_1.default.PRODUCTION_DB;
let authSecret = config_1.default.AUTH_SECRET;
exports.default = {
    localURI: localURI,
    remoteURI: remoteURI,
    authSecret: authSecret
};
//# sourceMappingURL=db.js.map