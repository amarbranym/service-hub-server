"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, default: "" },
    password: {
        type: String,
        select: false,
        default: "",
        validate: {
            validator: (value) => !value || value.length >= 6,
            message: "Password must be at least 6 characters when provided.",
        },
    },
    avatar: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
    },
    role: { type: String, enum: ["customer", "provider", "admin"], default: "customer" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
userSchema.pre("save", async function saveHook() {
    if (!this.isModified("password") || !this.password)
        return;
    this.password = await bcryptjs_1.default.hash(this.password, 10);
});
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    if (!this.password)
        return Promise.resolve(false);
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
exports.UserModel = mongoose_1.default.model("User", userSchema);
