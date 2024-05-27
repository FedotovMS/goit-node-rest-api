import bcrypt from "bcrypt";

const comparePassword = (password, hashPassword) =>
  bcrypt.compare(password, hashPassword);

export default comparePassword;
