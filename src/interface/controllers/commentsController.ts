import { Request, Response } from "express";
import { Types } from "mongoose";
import CommentService from "../../services/CommentService";
import Review from "../../entities/Review";

export const getComment = async (request: Request, response: Response) => {
    try {
        const { commentId } = request.params;

        if (!Types.ObjectId.isValid(commentId)) {
            response.status(400).json({ message: "Invalid comment ID" });
            return;
        }

        const comment = await CommentService.getCommentById(new Types.ObjectId(commentId));

        if (!comment) {
            response.status(404).json({ message: "Comment not found" });
            return;
        }

        response.status(200).json({ comment });
    } catch (error) {
        console.error("Error fetching comment:", error);
        response.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};


export const getCommentsByUser = async (request: Request, response: Response) => {
    try {
        const userId = request.user?.id;

        if (!userId || !Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: "Invalid user ID" });
            return;
        }

        const comments = await CommentService.getCommentsByUser(new Types.ObjectId(userId));

        response.status(200).json({ comments });
    } catch (error) {
        console.error("Error fetching user comments:", error);
        response.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const getCommentsByReview = async (request: Request, response: Response) => {
    try {
        const { reviewId } = request.params;

        if (!Types.ObjectId.isValid(reviewId)) {
            response.status(400).json({ message: "Invalid review ID" });
            return;
        }

        // Verifica se a review existe antes de buscar os comentários
        const reviewExists = await Review.exists({ _id: new Types.ObjectId(reviewId) });

        if (!reviewExists) {
            response.status(404).json({ message: "Review not found" });
            return;
        }

        const comments = await CommentService.getCommentsByReview(new Types.ObjectId(reviewId));
        response.status(200).json({ comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        response.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const postComment = async (request: Request, response: Response) => {
    try {
        const { reviewId, content } = request.body;
        const userId = request.user?.id;

        if (!Types.ObjectId.isValid(reviewId)) {
            response.status(400).json({ message: "Invalid review ID" });
            return;
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: "Invalid user ID" });
            return;
        }

        const savedComment = await CommentService.createComment({
            reviewId: new Types.ObjectId(reviewId),
            userId: new Types.ObjectId(userId),
            content
        });

        response.status(201).json({
            message: "Comment created successfully",
            comment: savedComment
        });
    } catch (error) {
        console.error("Error creating comment:", error);
        response.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const putComment = async (request: Request, response: Response) => {
    try {
        const { commentId } = request.params;
        const { content } = request.body;
        const userId = request.user?.id;

        if (!Types.ObjectId.isValid(commentId)) {
            response.status(400).json({ message: "Invalid comment ID" });
            return;
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: "Invalid user ID" });
            return;
        }

        const updatedComment = await CommentService.updateComment(
            new Types.ObjectId(commentId),
            new Types.ObjectId(userId),
            content
        );

        if (!updatedComment) {
            response.status(404).json({ message: "Comment not found or unauthorized" });
            return;
        }

        response.status(200).json({
            message: "Comment updated successfully",
            comment: updatedComment
        });
    } catch (error) {
        console.error("Error updating comment:", error);
        response.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const deleteComment = async (request: Request, response: Response) => {
    try {
        const { commentId } = request.params;
        const userId = request.user?.id;

        if (!Types.ObjectId.isValid(commentId)) {
            response.status(400).json({ message: "Invalid comment ID" });
            return;
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: "Invalid user ID" });
            return;
        }

        const deletedComment = await CommentService.deleteComment(
            new Types.ObjectId(commentId),
            new Types.ObjectId(userId)
        );

        if (!deletedComment) {
            response.status(404).json({ message: "Comment not found or unauthorized" });
            return;
        }

        response.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        response.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
