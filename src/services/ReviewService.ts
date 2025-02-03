import { Types } from "mongoose";
import Review from "../entities/Review";
import Book from "../entities/Book";
import User from "../entities/User";
import Comment from "../entities/Comment";

export default class ReviewService {
    static async getReviewById(reviewId: Types.ObjectId) {
        return await Review.findById(reviewId).populate("userId", "userName");
    }

    static async getReviewByUserAndBook(userId: Types.ObjectId, bookId: Types.ObjectId) {
        return await Review.findOne({ userId, bookId });
    }

    static async createReview(reviewData: { bookId: Types.ObjectId; userId: Types.ObjectId; title: string; rating: number; content: string }) {
        const { bookId, userId, title, rating, content } = reviewData;

        const newReview = new Review({
            bookId,
            userId,
            title,
            rating,
            content
        });

        const savedReview = await newReview.save();

        // Update references
        await Book.findByIdAndUpdate(bookId, { $push: { reviews: savedReview._id } });
        await User.findByIdAndUpdate(userId, { $push: { reviews: savedReview._id } });

        return savedReview;
    }

    static async updateReview(reviewId: Types.ObjectId, userId: Types.ObjectId, updateData: { title?: string; rating?: number; content?: string }) {
        return await Review.findOneAndUpdate(
            { _id: reviewId, userId },
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        );
    }

    static async deleteReview(reviewId: Types.ObjectId, userId: Types.ObjectId) {
        const review = await Review.findOneAndDelete({ _id: reviewId, userId });

        if (review) {
            // Remover referência da review do livro e do usuário
            await Book.findByIdAndUpdate(review.bookId, { $pull: { reviews: reviewId } });
            await User.findByIdAndUpdate(review.userId, { $pull: { reviews: reviewId } });

            // Deletar todos os comentários associados à review
            await Comment.deleteMany({ reviewId: review._id });
        }

        return review;
    }
    
    static async getReviewsByBook(bookId: Types.ObjectId) {
        return await Review.find({ bookId }).populate("userId", "userName");
    }

    static async getReviewsByUser(userId: Types.ObjectId) {
        return await Review.find({ userId }).populate("bookId", "title");
    }
}
