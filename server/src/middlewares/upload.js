import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ensure uploads directory exists with proper error handling
const uploadsDir = path.join(__dirname, "../../uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`✅ Uploads folder created at: ${uploadsDir}`);
  } else {
    console.log(`✅ Uploads folder already exists at: ${uploadsDir}`);
  }
} catch (err) {
  console.error(`❌ Failed to create uploads folder at ${uploadsDir}:`, err.message);
  console.error(`   Issue: Check folder permissions or disk space`);
  throw err; // fail fast if folder can't be created
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      cb(null, uploadsDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = Date.now() + '-' + crypto.randomBytes(6).toString('hex') + ext;
      cb(null, safeName);
    } catch (err) {
      cb(err);
    }
  },
});

const IMAGE_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
  fileFilter: (req, file, cb) => {
    if (IMAGE_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed (jpeg, png, gif, webp)"));
  },
});

export default upload;
