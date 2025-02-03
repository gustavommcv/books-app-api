import { model, Schema, Types } from "mongoose";
import { commentSchema, IComment } from "./Comment";

interface IReview extends Document {
    bookId: Types.ObjectId;
    userId: Types.ObjectId;
    rating: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;

    comments: IComment[];
}

const reviewSchema = new Schema<IReview>({
    bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    comments: [{ type: Schema.ObjectId, ref:  'Comment' }], // Array of comment IDs
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Review = model<IReview>('Review', reviewSchema);

export default Review;
