"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
let connectionPromise = null;
async function connectDB() {
    if (mongoose_1.default.connection.readyState === 1) {
        return;
    }
    if (connectionPromise) {
        await connectionPromise;
        return;
    }
    mongoose_1.default.set("strictQuery", true);
    connectionPromise = mongoose_1.default.connect(env_1.env.mongoUri, {
        serverSelectionTimeoutMS: 15000,
        // Fail fast if DB is unreachable instead of buffering model operations.
        bufferCommands: false,
    });
    try {
        await connectionPromise;
    }
    finally {
        connectionPromise = null;
    }
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
}
