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

export const postBook = async (request: Request, response: Response) => {
    try {
        // Create a new book instance using the request body
        const { title, author, description, genre, publicationDate, pageCount, cover } = request.body;

        const newBook = new Book({
            title,
            author,
            description,
            genre,
            publicationDate: new Date(publicationDate),
            pageCount,
            cover
        });

        // Save the book to the database
        const savedBook = await newBook.save();

        // Respond with the created book details
        response.status(201).json({
            message: "Book created successfully",
            book: savedBook
        });

    } catch (error) {
        console.error("Error creating book:", error);
        response.status(500).json({
            message: "Internal server error while creating the book",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

// PUT: Update a book by ID
export const putBook = async (request: Request, response: Response) => {
    try {
        const { bookId } = request.params;
        const updateData = request.body;

        // Find the book and update with new data
        const updatedBook = await Book.findByIdAndUpdate(bookId, updateData, {
            new: true, // Return the updated book
            runValidators: true // Ensure validation rules are applied
        });

        if (!updatedBook) {
            response.status(404).json({ message: 'Book not found' });
            return;
        }

        response.status(200).json({
            message: 'Book updated successfully',
            book: updatedBook
        });
    } catch (error) {
        console.error('Error updating book:', error);
        response.status(500).json({
            message: 'Internal server error while updating book',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// DELETE: Remove a book by ID
export const deleteBook = async (request: Request, response: Response) => {
    try {
        const { bookId } = request.params;

        // Find and delete the book
        const deletedBook = await Book.findByIdAndDelete(bookId);

        if (!deletedBook) {
            response.status(404).json({ message: 'Book not found' });
            return;
        }

        response.status(200).json({
            message: 'Book deleted successfully',
            book: deletedBook
        });
    } catch (error) {
        console.error('Error deleting book:', error);
        response.status(500).json({
            message: 'Internal server error while deleting book',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
