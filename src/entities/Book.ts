import { model, Schema, Types } from "mongoose";

interface IBook extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    cover: string;
}

const bookSchema = new Schema<IBook> ({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: true
    }
});

const Book = model<IBook>('Book', bookSchema);

export default Book;
