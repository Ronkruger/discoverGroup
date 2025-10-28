import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const REGION = process.env.S3_REGION || "";
const BUCKET = process.env.S3_BUCKET || "";

const s3 = new S3Client({
  region: REGION || undefined,
  credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
  } : undefined
});

export async function uploadBufferToS3(buffer: Buffer, originalName: string, mimetype: string) {
  if (!REGION || !BUCKET) {
    throw new Error("S3 not configured (S3_REGION/S3_BUCKET missing)");
  }
  const ext = originalName.includes(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
  const key = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: "public-read"
  });
  await s3.send(cmd);
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  return url;
}