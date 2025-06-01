import express from "express";
import { me, updateScore } from "../controller/me.controller";
import { requireAuth } from "../middlewares/auth";

export const meRoutes = express.Router();

meRoutes.get("/", requireAuth, me);

meRoutes.patch("/score", requireAuth, updateScore);
