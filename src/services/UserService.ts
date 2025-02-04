import User from "../entities/User";
import { Types } from "mongoose";

class UserService {
    static async getUserById(userId: Types.ObjectId) {
        return await User.findById(userId).select("profilePicture");
    }

    /**
     * Update a user's profile picture and bio
     * @param userId - The user's ObjectId
     * @param updateData - The data to update (bio and/or profilePicture)
     */
    static async updateProfile(
        userId: Types.ObjectId,
        updateData: { bio?: string; profilePicture?: string }
    ) {
        return await User.findByIdAndUpdate(
            userId,
            { ...updateData },
            { new: true, runValidators: true }
        );
    }

    /**
     * Get a user's profile with their reviews and comments
     * @param userId - The user's ObjectId
     */
    static async getUserProfile(userId: Types.ObjectId) {
        return await User.findById(userId)
            .select("userName profilePicture bio reviews comments")
            .populate({
                path: "reviews",
                select: "title rating content createdAt",
            })
            .populate({
                path: "comments",
                select: "content reviewId createdAt",
                populate: {
                    path: "reviewId",
                    select: "title",
                }
            });
    }

    /**
     * Find a user by email (used during login)
     * @param email - The email of the user
     */
    static async findByEmail(email: string) {
        return await User.findOne({ email });
    }

    /**
     * Register a new user
     * @param userData - Object containing user data
     */
    static async registerUser(userData: {
        userName: string;
        email: string;
        password: string;
    }) {
        const newUser = new User(userData);
        return await newUser.save();
    }
}

export default UserService;
