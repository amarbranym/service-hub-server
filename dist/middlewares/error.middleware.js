"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const http_1 = require("../constants/http");
const env_1 = require("../config/env");
const api_error_1 = require("../utils/api-error");
function notFoundHandler(_req, res) {
    res.status(http_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Route not found.",
    });
}
function errorHandler(error, _req, res, _next) {
    if (error instanceof api_error_1.ApiError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
            details: error.details ?? undefined,
        });
        return;
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(http_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message,
        ...(env_1.env.nodeEnv === "development" && error instanceof Error ? { stack: error.stack } : {}),
    });
}
