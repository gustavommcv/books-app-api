import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ReviewService from '../../services/ReviewService';
import Book from '../../entities/Book';

export const getReviewsByBook = async (request: Request, response: Response) => {
    try {
        const { bookId } = request.params;

        if (!Types.ObjectId.isValid(bookId)) {
            response.status(400).json({ message: 'Invalid book ID' });
            return;
        }

        const book = await Book.findById(bookId);
        if (!book) {
            response.status(404).json({ message: 'Book not found' });
            return;
        }

        const reviews = await ReviewService.getReviewsByBook(new Types.ObjectId(bookId));

        response.status(200).json({ reviews });
    } catch (error) {
        console.error('Error fetching reviews by book:', error);
        response.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getReviewsByUser = async (request: Request, response: Response) => {
    try {
        const userId = request.user?.id;

        if (!userId || !Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        const reviews = await ReviewService.getReviewsByUser(new Types.ObjectId(userId));

        response.status(200).json({ reviews });
    } catch (error) {
        console.error('Error fetching reviews by user:', error);
        response.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};


export const getReview = async (request: Request, response: Response) => {
    try {
        const { reviewId } = request.params;

        // Check if reviewId is valid
        if (!Types.ObjectId.isValid(reviewId)) {
            response.status(400).json({ message: 'Invalid review ID' });
            return;
        }

        // Fetch the review using the service
        const review = await ReviewService.getReviewById(new Types.ObjectId(reviewId));

        if (!review) {
            response.status(404).json({ message: 'Review not found' });
            return;
        }

        response.status(200).json({
            message: 'Review retrieved successfully',
            review
        });
    } catch (error) {
        console.error('Error fetching review:', error);
        response.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const postReview = async (request: Request, response: Response) => {
    try {
        const { bookId, title, rating, content } = request.body;
        const userId = request.user?.id;

        if (!Types.ObjectId.isValid(bookId)) {
            response.status(400).json({ message: 'Invalid book ID' });
            return;
        }

        const book = await Book.findById(bookId);
        if (!book) {
            response.status(404).json({ message: 'Book not Found' });
            return;
        }

        if (!userId || !Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        const existingReview = await ReviewService.getReviewByUserAndBook(
            new Types.ObjectId(userId),
            new Types.ObjectId(bookId)
        );

        if (existingReview) {
            response.status(400).json({ message: 'You have already reviewed this book' });
            return;
        }

        const newReview = await ReviewService.createReview({
            bookId: new Types.ObjectId(bookId),
            userId: new Types.ObjectId(userId),
            title,
            rating,
            content
        });

        response.status(201).json({ message: 'Review created successfully', review: newReview });
    } catch (error) {
        console.error('Error creating review:', error);
        response.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const putReview = async (request: Request, response: Response) => {
    try {
        const { reviewId } = request.params;
        const { title, rating, content } = request.body;
        const userId = request.user?.id;

        if (!Types.ObjectId.isValid(reviewId) || !userId) {
            response.status(400).json({ message: 'Invalid review ID or user ID' });
            return;
        }

        const updatedReview = await ReviewService.updateReview(
            new Types.ObjectId(reviewId),
            new Types.ObjectId(userId),
            { title, rating, content }
        );

        if (!updatedReview) {
            response.status(404).json({ message: 'Review not found or unauthorized to edit' });
            return;
        }

        response.status(200).json({ message: 'Review updated successfully', review: updatedReview });
    } catch (error) {
        console.error('Error updating review:', error);
        response.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const deleteReview = async (request: Request, response: Response) => {
    try {
        const { reviewId } = request.params;
        const userId = request.user?.id;

        if (!Types.ObjectId.isValid(reviewId) || !userId) {
            response.status(400).json({ message: 'Invalid review ID or user ID' });
            return;
        }

        const deletedReview = await ReviewService.deleteReview(
            new Types.ObjectId(reviewId),
            new Types.ObjectId(userId)
        );

        if (!deletedReview) {
            response.status(404).json({ message: 'Review not found or unauthorized to delete' });
            return;
        }

        response.status(200).json({
            message: 'Review deleted successfully',
            review: deletedReview
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        response.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

