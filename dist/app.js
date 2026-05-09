"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middlewares/error.middleware");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Temporary: allow any origin / method / header (dev + cross-domain client until you lock this down).
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Max-Age", "86400");
    const requested = req.header("access-control-request-headers");
    if (requested) {
        res.setHeader("Access-Control-Allow-Headers", requested);
    }
    if (req.method?.toUpperCase() === "OPTIONS") {
        res.status(204).end();
        return;
    }
    next();
});
// Default helmet sets Cross-Origin-Resource-Policy: same-origin, which breaks cross-origin API reads.
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use((0, morgan_1.default)(env_1.env.nodeEnv === "development" ? "dev" : "combined"));
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api/v1", routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
