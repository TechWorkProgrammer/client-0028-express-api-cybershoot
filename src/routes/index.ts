import express from "express";
import { authRoutes } from "./auth.routes";
import { meRoutes } from "./me.routes";
import { userRoutes } from "./user.routes";

export const routes = express.Router();

routes.use("/auth", authRoutes);
routes.use("/me", meRoutes);
routes.use("/users", userRoutes);
