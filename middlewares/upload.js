import multer from "multer";
import path from "path";

const destination = path.resolve("tmp");

const storage = multer.diskStorage({
  destination,
  filename: (req, file, callback) => {
    const uniquePreffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniquePreffix}_${file.originalname}`;
    callback(null, filename);
  },
});

const limits = {
  filesize: 1024 * 1024 * 5,
};

const imageFormats = ["jpg", "png", "webp", "gif"];

const fileFilter = (req, file, callback) => {
  const extension = file.originalname.split(".").pop();
  if (!imageFormats.includes(extension)) {
    return callback(HttpError(400, `Unsupported file type: .${extension}`));
  }
  callback(null, true);
};

const upload = multer({
  storage,
  limits,
  fileFilter,
});

export default upload;
