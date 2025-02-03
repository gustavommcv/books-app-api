import express from "express";
import { body, param } from "express-validator";
import { authMiddleware } from "../../middlewares/authMiddleware";
import validateRequest from "../../middlewares/validateRequest";
import { getCommentsByReview, postComment, putComment, deleteComment, getCommentsByUser, getComment } from "../controllers/commentsController";

const commentsRoutes = express.Router();

/**
 * GET all comments made by the authenticated user
 */
commentsRoutes.get(
    "/user",
    authMiddleware,
    getCommentsByUser
);

/**
 * GET all comments for a specific review
 */
commentsRoutes.get(
    "/review/:reviewId",
    param("reviewId").isMongoId().withMessage("Invalid review ID format"),
    validateRequest,
    getCommentsByReview
);

/**
 * GET a comment by its ID
 */
commentsRoutes.get(
    "/:commentId",
    param("commentId").isMongoId().withMessage("Invalid comment ID format"),
    validateRequest,
    getComment
);

/**
 * POST a new comment to a review
 */
commentsRoutes.post(
    "/",
    authMiddleware,
    [
        body("reviewId").isMongoId().withMessage("Review ID must be valid"),
        body("content")
            .isLength({ min: 1, max: 1000 })
            .withMessage("Content must be between 1 and 1000 characters")
    ],
    validateRequest,
    postComment
);

/**
 * PUT - Edit an existing comment by its ID
 */
commentsRoutes.put(
    "/:commentId",
    authMiddleware,
    [
        param("commentId").isMongoId().withMessage("Invalid comment ID format"),
        body("content")
            .isLength({ min: 1, max: 1000 })
            .withMessage("Content must be between 1 and 1000 characters")
    ],
    validateRequest,
    putComment
);

/**
 * DELETE a comment by its ID
 */
commentsRoutes.delete(
    "/:commentId",
    authMiddleware,
    param("commentId").isMongoId().withMessage("Invalid comment ID format"),
    validateRequest,
    deleteComment
);

export default commentsRoutes;
