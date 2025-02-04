import fs from "fs";
import multer, { StorageEngine } from "multer";
import path from "path";
import { Request } from "express";
import UserService from "../services/UserService";
import { Types } from "mongoose"; // Import to convert string to ObjectId

// Define the upload directory
const uploadDir = path.join(__dirname, "../../public/uploads/profile-pictures");

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure the storage engine for multer
const storage: StorageEngine = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (request, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

// Custom file filter to handle old image deletion
const fileFilter = async (request: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    try {
        const userId = request.user?.id;
        if (!userId) {
            return cb(new Error("User ID is required"));
        }

        // Convert userId to ObjectId
        const objectId = new Types.ObjectId(userId);

        // Fetch current user to check the old profile picture
        const currentUser = await UserService.getUserById(objectId);
        if (currentUser?.profilePicture) {
            const oldPicturePath = path.join(__dirname, "../../public", currentUser.profilePicture);
            if (fs.existsSync(oldPicturePath)) {
                fs.unlinkSync(oldPicturePath); // Delete the old profile picture
            }
        }

        cb(null, true); // Proceed with the new file upload
    } catch (error) {
        console.error("Error during profile picture deletion:", error);
        cb(new Error("Failed to delete the old profile picture"));
    }
};

// Configure multer with storage and custom fileFilter
const uploadMiddleware = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter,
});

export const uploadSingle = uploadMiddleware.single("profilePicture");
