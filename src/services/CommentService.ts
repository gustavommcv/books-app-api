import { Types } from "mongoose";
import Comment from "../entities/Comment";
import User from "../entities/User";
import Review from "../entities/Review";

interface CommentData {
    reviewId: Types.ObjectId;
    userId: Types.ObjectId;
    content: string;
}

class CommentService {
    static async getCommentById(commentId: Types.ObjectId) {
        return await Comment.findById(commentId).populate("userId", "userName");
    }    

    static async getCommentsByReview(reviewId: Types.ObjectId) {
        return await Comment.find({ reviewId }).populate("userId", "userName");
    }

    // Fetch all comments made by a specific user
    static async getCommentsByUser(userId: Types.ObjectId) {
        return await Comment.find({ userId }).populate("reviewId", "content");
    }

    static async createComment(commentData: CommentData) {
        const { reviewId, userId, content } = commentData;

        // Create the comment
        const newComment = new Comment({
            reviewId,
            userId,
            content
        });

        const savedComment = await newComment.save();

        // Associate the comment with the review
        await Review.findByIdAndUpdate(reviewId, {
            $push: { comments: savedComment._id }
        });

        // Associate the comment with the user
        await User.findByIdAndUpdate(userId, {
            $push: { comments: savedComment._id }
        });

        return savedComment;
    }

    static async updateComment(commentId: Types.ObjectId, userId: Types.ObjectId, content: string) {
        return await Comment.findOneAndUpdate(
            { _id: commentId, userId },
            { content, updatedAt: new Date() },
            { new: true, runValidators: true }
        );
    }

    static async deleteComment(commentId: Types.ObjectId, userId: Types.ObjectId) {
        const comment = await Comment.findOneAndDelete({ _id: commentId, userId });

        if (comment) {
            // Remove the reference from the review
            await Review.findByIdAndUpdate(comment.reviewId, {
                $pull: { comments: commentId }
            });

            // Remove the reference from the user
            await User.findByIdAndUpdate(userId, {
                $pull: { comments: commentId }
            });
        }

        return comment;
    }
}

export default CommentService;
