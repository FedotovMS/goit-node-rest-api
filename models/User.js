import { Schema, model } from "mongoose";
import { handleSaveError, saveUpdatedSettings } from "./hooks.js";

import { emailRegexp } from "../constants/user-constants.js";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Password is required"],
      match: emailRegexp,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: String,
  },
  { versionKey: false, timestamp: true }
);

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", saveUpdatedSettings);

userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);

export default User;
