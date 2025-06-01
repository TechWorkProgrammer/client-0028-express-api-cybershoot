import express from "express";
import { fetchUsers } from "../controller/user.controller";

export const userRoutes = express.Router();

userRoutes.get("/", fetchUsers);
