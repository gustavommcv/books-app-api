import { model, Schema, Types } from "mongoose";

export interface IComment extends Document {
    reviewId: Types.ObjectId;
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export const commentSchema = new Schema<IComment>({
    reviewId: {
        type: Schema.Types.ObjectId,
        ref: 'Review',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update the `updatedAt` field before saving
commentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Comment = model<IComment>('Comment', commentSchema);

export default Comment;
