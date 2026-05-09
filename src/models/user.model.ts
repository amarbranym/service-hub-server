import bcrypt from "bcryptjs";
import mongoose, { type HydratedDocument, type Model } from "mongoose";

export type UserRole = "customer" | "provider" | "admin";

export type User = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  avatar: {
    url: string;
    publicId: string;
  };
  role: UserRole;
  isActive: boolean;
};

type UserMethods = {
  comparePassword(candidatePassword: string): Promise<boolean>;
};

type UserModel = Model<User, object, UserMethods>;

const userSchema = new mongoose.Schema<User, UserModel, UserMethods>(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, default: "" },
    password: {
      type: String,
      select: false,
      default: "",
      validate: {
        validator: (value: string) => !value || value.length >= 6,
        message: "Password must be at least 6 characters when provided.",
      },
    },
    avatar: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    role: { type: String, enum: ["customer", "provider", "admin"], default: "customer" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function saveHook() {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(this: HydratedDocument<User>, candidatePassword: string) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<User, UserModel>("User", userSchema);
