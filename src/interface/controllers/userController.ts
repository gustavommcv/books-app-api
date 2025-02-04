import { Request, Response } from "express";
import UserService from "../../services/UserService";
import { Types } from "mongoose";
import path from "path";

export const getLoggedUserProfile = async (request: Request, response: Response) => {
    try {
        const userId = request.user?.id;

        if (!userId || !Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: "Invalid user ID" });
            return;
        }

        const userProfile = await UserService.getUserProfile(new Types.ObjectId(userId));
        if (!userProfile) {
            response.status(404).json({ message: "User not found" });
            return;
        }

        response.status(200).json(userProfile);
        return;
    } catch (error) {
        console.error("Error fetching logged-in user profile:", error);
        response.status(500).json({ message: "Internal server error" });
        return;
    }
};

export const updateProfile = async (request: Request, response: Response) => {
    try {
        const userId = request.user?.id;
        const { bio } = request.body;
        const newProfilePicture = request.file?.path;

        if (!userId || !Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: "Invalid user ID" });
            return;
        }

        let relativePath = newProfilePicture
            ? `/uploads/profile-pictures/${path.basename(newProfilePicture)}`
            : undefined;

        // Update the user profile with the new data
        const updatedUser = await UserService.updateProfile(new Types.ObjectId(userId), {
            bio,
            profilePicture: relativePath,
        });

        if (!updatedUser) {
            response.status(500).json({ message: "Profile update failed" });
            return;
        }

        response.status(200).json({
            message: "Profile updated successfully",
            user: {
                ...updatedUser.toObject(),
                profilePicture: relativePath || updatedUser.profilePicture,
            },
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        response.status(500).json({ message: "Internal server error" });
    }
};

export const getUserProfile = async (request: Request, response: Response) => {
    try {
        const { userId } = request.params;

        if (!Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: "Invalid user ID" });
            return;
        }

        const userProfile = await UserService.getUserProfile(new Types.ObjectId(userId));
        if (!userProfile) {
            response.status(404).json({ message: "User not found" });
            return;
        }

        response.status(200).json(userProfile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        response.status(500).json({ message: "Internal server error" });
    }
};
