import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import validateRequest from "../../middlewares/validateRequest";
import { uploadSingle } from "../../middlewares/uploadMiddleware";
import { updateProfile, getUserProfile, getLoggedUserProfile } from "../controllers/userController";

const userRoutes = express.Router();

// GET - Fetch the logged-in user's profile
userRoutes.get("/profile", authMiddleware, getLoggedUserProfile);

// GET - Fetch user profile by ID
userRoutes.get(
    "/profile/:userId",
    getUserProfile
);

// PUT - Update user profile (bio and profile picture)
userRoutes.put(
    "/profile",
    authMiddleware,
    uploadSingle, // Use the single file upload middleware
    validateRequest,
    updateProfile
);

export default userRoutes;
