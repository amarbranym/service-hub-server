"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const node_crypto_1 = require("node:crypto");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_1 = require("../constants/http");
const env_1 = require("../config/env");
const api_error_1 = require("../utils/api-error");
function getRequestId(request) {
    const headerValue = request.header("x-request-id");
    if (headerValue) {
        return headerValue;
    }
    return (0, node_crypto_1.randomUUID)();
}
function sendError(request, response, statusCode, code, message, details, stack) {
    const body = {
        success: false,
        code,
        message,
        requestId: getRequestId(request),
    };
    if (details !== undefined) {
        body.details = details;
    }
    if (stack) {
        body.stack = stack;
    }
    response.status(statusCode).json(body);
}
function mapUnknownError(error) {
    if (error instanceof mongoose_1.default.Error.ValidationError) {
        return {
            statusCode: http_1.StatusCodes.BAD_REQUEST,
            code: "VALIDATION_ERROR",
            message: "Validation failed for one or more fields.",
            details: Object.values(error.errors).map((item) => item.message),
        };
    }
    if (error instanceof mongoose_1.default.Error.CastError) {
        return {
            statusCode: http_1.StatusCodes.BAD_REQUEST,
            code: "INVALID_ID",
            message: `Invalid ${error.path} provided.`,
            details: { value: error.value },
        };
    }
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        const duplicateKeyError = error;
        return {
            statusCode: http_1.StatusCodes.CONFLICT,
            code: "DUPLICATE_RESOURCE",
            message: "A record with the same value already exists.",
            details: duplicateKeyError.keyValue,
        };
    }
    if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
        return {
            statusCode: http_1.StatusCodes.UNAUTHORIZED,
            code: "TOKEN_EXPIRED",
            message: "Authentication token has expired.",
        };
    }
    if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
        return {
            statusCode: http_1.StatusCodes.UNAUTHORIZED,
            code: "INVALID_TOKEN",
            message: "Authentication token is invalid.",
        };
    }
    if (error instanceof SyntaxError && "body" in error) {
        return {
            statusCode: http_1.StatusCodes.BAD_REQUEST,
            code: "INVALID_JSON",
            message: "Request body contains invalid JSON.",
        };
    }
    if (error instanceof Error) {
        const name = error.name;
        const msg = error.message ?? "";
        if (name === "MongooseServerSelectionError" ||
            name === "MongoServerSelectionError" ||
            name === "MongoNetworkError" ||
            msg.includes("buffering timed out") ||
            msg.includes("ECONNREFUSED")) {
            return {
                statusCode: http_1.StatusCodes.SERVICE_UNAVAILABLE,
                code: "DATABASE_UNAVAILABLE",
                message: "Cannot reach the database. On MongoDB Atlas: allow IP 0.0.0.0/0 (or Vercel egress), confirm MONGO_URI in Vercel Environment Variables, and ensure the cluster is not paused.",
            };
        }
    }
    return {
        statusCode: http_1.StatusCodes.INTERNAL_SERVER_ERROR,
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong. Please try again later.",
    };
}
function notFoundHandler(request, res) {
    sendError(request, res, http_1.StatusCodes.NOT_FOUND, "ROUTE_NOT_FOUND", `Route not found: ${request.method} ${request.originalUrl}`);
}
function errorHandler(error, request, res, _next) {
    if (error instanceof api_error_1.ApiError) {
        sendError(request, res, error.statusCode, "API_ERROR", error.message, error.details, env_1.env.nodeEnv === "development" ? error.stack : undefined);
        return;
    }
    const mapped = mapUnknownError(error);
    sendError(request, res, mapped.statusCode, mapped.code, mapped.message, mapped.details, env_1.env.nodeEnv === "development" && error instanceof Error ? error.stack : undefined);
}
