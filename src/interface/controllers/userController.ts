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
        const { userName, bio } = request.body; 
        const newProfilePicture = request.file?.path;

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return response.status(400).json({ message: "Invalid user ID" });
        }

        const updateData: { [key: string]: any } = {};

        if (userName) updateData.userName = userName;
        if (bio) updateData.bio = bio;
        if (newProfilePicture) {
            updateData.profilePicture = `/uploads/profile-pictures/${path.basename(newProfilePicture)}`;
        }

        if (Object.keys(updateData).length === 0) {
            return response.status(400).json({ message: "No data provided for update" });
        }

        const updatedUser = await UserService.updateProfile(new Types.ObjectId(userId), updateData);

        if (!updatedUser) {
            return response.status(500).json({ message: "Profile update failed" });
        }

        response.status(200).json({
            message: "Profile updated successfully",
            user: {
                ...updatedUser.toObject(),
                profilePicture: updateData.profilePicture || updatedUser.profilePicture,
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
