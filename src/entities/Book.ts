import { model, Schema, Types } from "mongoose";

// Interface defining the book attributes
interface IBook extends Document {
    _id: Types.ObjectId;
    title: string;
    author: string;
    description: string;
    genre: string[];
    publicationDate: Date;
    pageCount: number;
    cover: string;

    reviews?: Types.ObjectId[];
}

// Schema for the Book model
const bookSchema = new Schema<IBook>({
    title: {
        type: String,
        required: true // Title is required
    },
    author: {
        type: String,
        required: true // Author is required
    },
    description: {
        type: String,
        required: true // Description is required
    },
    genre: {
        type: [String], // Array of genres
        required: true // At least one genre is required
    },
    publicationDate: {
        type: Date,
        required: true // Publication date is required
    },
    pageCount: {
        type: Number,
        required: true // Page count is required
    },
    cover: {
        type: String,
        required: true // Cover image URL is required
    },

    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

// Creating the Book model
const Book = model<IBook>('Book', bookSchema);

export default Book;
