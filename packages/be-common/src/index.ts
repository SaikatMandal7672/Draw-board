import "dotenv/config";

export const JWT_SECRET = process.env.JWT_KEY || "mysecret";

export const HTTP_URL = process.env.HTTP_URL || "http://localhost:3001";
