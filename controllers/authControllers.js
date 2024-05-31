import * as authServices from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import comparePassword from "../helpers/comparePassword.js";
import { createToken } from "../helpers/jwt.js";
import path from "path";
import Jimp from "jimp";

const avatarsPath = path.resolve("public", "avatars");
const register = async (req, res) => {
  const { email } = req.body;

  const user = await authServices.findUser({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const newUser = await authServices.saveUser(req.body);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
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
  const { _id } = req.user;
  const { path: oldPath, filename } = req.file;
  const image = await jimp.read(oldPath);
  await image.scaleToFit(250, 250);

  const newPath = path.join(avatarsPath, filename);
  await image.writeAsync(newPath);
  await fs.unlink(oldPath);
  const avatarURL = path.join("avatars", filename);

  const user = await authServices.updateUser({ _id }, { avatarURL });

  res.json({
    avatarURL: user.avatarURL,
  });
};

export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
