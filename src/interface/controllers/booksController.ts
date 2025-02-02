import { Request, Response } from "express";
import Book from "../../entities/Book";

export const getBooks = async (request: Request, response: Response) => {
    try {
        // Retrieve query params for pagination (default page 1, 10 items per page)
        const page = parseInt(request.query.page as string) || 1;
        const limit = parseInt(request.query.limit as string) || 10;

        // Fetch books with pagination
        const books = await Book.find()
            .skip((page - 1) * limit)
            .limit(limit);

        // Count total books for pagination metadata
        const totalBooks = await Book.countDocuments();

        // Return books along with pagination details
        response.status(200).json({
            message: "Books retrieved successfully",
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalBooks / limit),
                totalBooks,
            },
            books,
        });
    } catch (error) {
        console.error("Error fetching books:", error);
        response.status(500).json({
            message: "Internal server error while fetching books",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

export const getBook = async (request: Request, response: Response) => {
    try {
        const book = await Book.findById(request.params.bookId);

        if (!book) {
            response.status(404).json({
                message: "Book not found"
            })
        }

        response.status(200).json({
            message: "Book retrieved successfully",
            book
        })
    } catch (error) {
        console.error(console.error("Error fetching book:", error));
        response.status(500).json({
            message: "Internal server error while fetching books",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
