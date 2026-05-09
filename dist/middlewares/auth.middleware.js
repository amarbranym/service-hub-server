"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const http_1 = require("../constants/http");
const api_error_1 = require("../utils/api-error");
const token_1 = require("../utils/token");
function requireAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    if (!token) {
        throw new api_error_1.ApiError(http_1.StatusCodes.UNAUTHORIZED, "Authorization token is required.");
    }
    try {
        req.user = (0, token_1.verifyAccessToken)(token);
        next();
    }
    catch (_error) {
        throw new api_error_1.ApiError(http_1.StatusCodes.UNAUTHORIZED, "Invalid or expired token.");
    }
}
function requireRole(roles) {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new api_error_1.ApiError(http_1.StatusCodes.FORBIDDEN, "You are not allowed to access this resource.");
        }
        next();
    };
}
