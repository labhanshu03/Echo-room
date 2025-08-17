import express from "express";
import { getUserInfo, login, signUp, updateProfile } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const authRoutes=express.Router()

authRoutes.post("/signup",signUp)
authRoutes.post("/login",login)
authRoutes.get("/userinfo",verifyToken,getUserInfo)
authRoutes.post("/update-profile",verifyToken,updateProfile)

export default authRoutes