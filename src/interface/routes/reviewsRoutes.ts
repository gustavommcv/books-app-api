import express from 'express';
import { body, param } from 'express-validator';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware } from '../../middlewares/authMiddleware';
import authorizeAdmin from '../../middlewares/authorizeAdmin';
import { 
    postReview, 
    getReview, 
    putReview, 
    deleteReview, 
    getReviewsByBook, 
    getReviewsByUser 
} from '../controllers/reviewsController';

const reviewsRoutes = express.Router();

// GET all reviews by the authenticated user
reviewsRoutes.get(
    '/user',
    authMiddleware,
    getReviewsByUser
);

// GET a review by ID
reviewsRoutes.get(
    '/:reviewId',
    param('reviewId').isMongoId().withMessage('Invalid review ID format'),
    validateRequest,
    getReview
);

// GET all reviews for a specific book
reviewsRoutes.get(
    '/book/:bookId',
    param('bookId').isMongoId().withMessage('Invalid book ID format'),
    validateRequest,
    getReviewsByBook
);

// POST - Create a new review
reviewsRoutes.post(
    '/',
    authMiddleware,
    [
        body('bookId').isMongoId().withMessage('A valid bookId is required'),
        body('rating')
            .isInt({ min: 1, max: 5 })
            .withMessage('Rating must be an integer between 1 and 5'),
        body('content')
            .isLength({ min: 10, max: 2000 })
            .withMessage('Review content must be between 10 and 2000 characters'),
    ],
    validateRequest,
    postReview
);

// PUT - Edit an existing review
reviewsRoutes.put(
    '/:reviewId',
    authMiddleware,
    param('reviewId').isMongoId().withMessage('Invalid review ID format'),
    validateRequest,
    putReview
);

// DELETE - Delete a review by ID
reviewsRoutes.delete(
    '/:reviewId',
    authMiddleware,
    authorizeAdmin,
    param('reviewId').isMongoId().withMessage('Invalid review ID format'),
    validateRequest,
    deleteReview
);

export default reviewsRoutes;
