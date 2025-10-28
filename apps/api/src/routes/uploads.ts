import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadBufferToS3 } from "../lib/s3Upload";

const router = express.Router();

// Local uploads dir (dev)
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage for local disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(null, false);
    cb(null, true);
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    // If STORAGE_PROVIDER === 's3' and s3 helper is available, upload to S3
    if (process.env.STORAGE_PROVIDER === "s3" && req.file) {
      // read file buffer (disk multer saved it)
      const filePath = req.file.path;
      const buffer = fs.readFileSync(filePath);
      // use originalname and mimetype
      const url = await uploadBufferToS3(buffer, req.file.originalname, req.file.mimetype);
      // Optionally remove the temp local file if you don't want to keep it
      try { fs.unlinkSync(filePath); } catch { /* ignore */ }
      return res.json({ url });
    }

    // Otherwise return a public URL for the locally stored file
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const publicBase = process.env.PUBLIC_BASE_URL || process.env.FRONTEND_BASE_URL || "http://localhost:5173";
    const url = `${publicBase.replace(/\/$/, "")}/uploads/${req.file.filename}`;
    return res.json({ url });
  } catch (err) {
    console.error("uploads error", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export default router;