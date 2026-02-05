import type { Request, Response, NextFunction } from "express";

export default function checkAPIKey(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const apiKey = req.header("x-api-key");
  if (!apiKey)
    return res.status(400).json({ message: "Bad Request: API Key is missing" });

  const validApiKey = process.env.API_KEY;

  if (apiKey && apiKey === validApiKey) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Invalid API Key" });
  }
}
