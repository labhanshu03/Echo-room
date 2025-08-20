import express from "express";
import { getUserInfo, login, signUp, updateProfile,addProfileImage,removeProfileImage } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import upload from "../middlewares/multer.js";

const authRoutes=express.Router()

authRoutes.post("/signup",signUp)
authRoutes.post("/login",login)
authRoutes.get("/userinfo",verifyToken,getUserInfo)
authRoutes.post("/update-profile",verifyToken,updateProfile)
authRoutes.post("/add-profile-image",verifyToken,upload.single("profile-image"),addProfileImage)
authRoutes.delete("/remove-profile-image",verifyToken,removeProfileImage)
export default authRoutes