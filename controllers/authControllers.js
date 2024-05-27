import * as authServices from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import comparePassword from "../helpers/comparePassword.js";
import { createToken } from "../helpers/jwt.js";

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

export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
};
