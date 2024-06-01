import * as authServices from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import comparePassword from "../helpers/comparePassword.js";
import { createToken } from "../helpers/jwt.js";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import gravatar from "gravatar";
import { nanoid } from "nanoid";
import sendEmail from "../helpers/sendEmail.js";

const avatarsPath = path.resolve("public", "avatars");

const register = async (req, res) => {
  const { email } = req.body;

  const user = await authServices.findUser({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }
  const verificationToken = nanoid();

  const avatarURL = gravatar.url(email, { s: "250", d: "mp" });

  const newUser = await authServices.saveUser({
    ...req.body,
    avatarURL,
    verificationToken,
  });

  const verificationLetter = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Verify your email</a>`,
  };

  await sendEmail(verificationLetter);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await authServices.findUser({ verificationToken });
    if (!user) {
      throw HttpError(404);
    }
    await authServices.updateUser(user._id, {
      verify: true,
      verificationToken: null,
    });
    res.json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

const resendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await authServices.findUser({ email });
    if (!user) {
      throw HttpError(400, "missing required field email");
    }

    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }

    const verificationLetter = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${user.verificationToken}">Verify your email</a>`,
    };

    await sendEmail(verificationLetter);

    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  if (!user.verify) {
    throw HttpError(401, "Email is not verified");
  }
  const comparedPassword = await comparePassword(password, user.password);

  if (!comparedPassword) {
    throw HttpError(401, "Email or password invalid");
  }

  const { _id: id, subscription } = user;

  const payload = {
    id,
  };

  const token = createToken(payload);
  await authServices.updateUser({ _id: id }, { token });

  res.json({
    token,
    user: {
      email,
      subscription,
    },
  });
};

const getCurrent = (req, res) => {
  const { subscription, email } = req.user;
  res.json({
    email,
    subscription,
    avatarURL,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await authServices.updateUser({ _id }, { token: "" });
  res.status(204).json();
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;
  const user = await authServices.updateUser({ _id }, { subscription });

  res.json({
    email: user.email,
    subscription,
  });
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw HttpError(400, "No file provided for upload");
    }
    const { _id } = req.user;
    const { path: oldPath, filename } = req.file;

    console.log(`User ID: ${_id}`);
    console.log(`Temp Path: ${oldPath}`);
    console.log(`Filename: ${filename}`);

    const image = await Jimp.read(oldPath);

    await image.resize(250, 250);

    const uniqueFilename = `${_id}_${filename}`;

    const newPath = path.join(avatarsPath, uniqueFilename);

    await image.writeAsync(newPath);
    await fs.unlink(oldPath);

    const avatarURL = path.join("avatars", uniqueFilename);

    await authServices.updateUser({ _id }, { avatarURL });

    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register: ctrlWrapper(register),
  verifyEmail: ctrlWrapper(verifyEmail),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
