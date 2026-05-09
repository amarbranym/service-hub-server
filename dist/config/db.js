"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
let isConnected = false;
async function connectDB() {
    if (isConnected || mongoose_1.default.connection.readyState === 1) {
        return;
    }
    mongoose_1.default.set("strictQuery", true);
    await mongoose_1.default.connect(env_1.env.mongoUri, {
        serverSelectionTimeoutMS: 15000,
        // Prefer IPv4; some Windows/Atlas setups fail SRV resolution over IPv6.
        family: 4,
    });
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
}
