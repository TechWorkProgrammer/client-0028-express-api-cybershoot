import express from "express";
import { refreshTokens } from "../controller/auth.controller";

export const authRoutes = express.Router();

authRoutes.post("/refresh-tokens", refreshTokens);
