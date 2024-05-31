import HttpError from "../helpers/HttpError.js";

const isFileUploaded = (req, res, next) => {
  if (!req.file) {
    next(HttpError(400, "No file provided for upload"));
  }
};

export default isFileUploaded;
