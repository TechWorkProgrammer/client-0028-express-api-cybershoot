export function decryptScore(encryptedScore: string) {
  const buffer = Buffer.from(encryptedScore, "base64");
  return buffer.toString("utf8");
}
