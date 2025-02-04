import { Request, Response } from "express";
import Book from "../../entities/Book";
import Review from "../../entities/Review";
import { Types } from "mongoose";

export const getBooks = async (request: Request, response: Response) => {
    try {
        // Search filters
        const { title, author, genre, minPages, maxPages, minDate, maxDate, sort, order } = request.query;

        // Building filters
        const filters: any = {};

        if (title) {
            filters.title = { $regex: title, $options: "i" }; // Case-insensitive search
        }

        if (author) {
            filters.author = { $regex: author, $options: "i" };
        }

        if (genre) {
            filters.genre = genre; // Can be an array of genres
        }

        if (minPages) {
            filters.pageCount = { ...filters.pageCount, $gte: Number(minPages) };
        }

        if (maxPages) {
            filters.pageCount = { ...filters.pageCount, $lte: Number(maxPages) };
        }

        if (minDate) {
            filters.publicationDate = { ...filters.publicationDate, $gte: new Date(minDate as string) };
        }

        if (maxDate) {
            filters.publicationDate = { ...filters.publicationDate, $lte: new Date(maxDate as string) };
        }

        // Retrieve query params for pagination (default page 1, 10 items per page)
        const page = parseInt(request.query.page as string) || 1;
        const limit = parseInt(request.query.limit as string) || 10;

        const sortField = (sort as string) || "title"; // Sorts by title by default
        const sortOrder = order === "desc" ? -1 : 1;   // Descending order if specified "desc", if not ascending

        // Fetch books with pagination
        const books = await Book.find(filters)
            .sort({ [sortField]: sortOrder }) // Applying Ordering
            .skip((page - 1) * limit)
            .limit(limit);

        // Count total books for pagination metadata
        const totalBooks = await Book.countDocuments(filters);

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
            });
            return;
        }

        response.status(200).json({
            message: "Book retrieved successfully",
            book
        });
    } catch (error) {
        console.error(console.error("Error fetching book:", error));
        response.status(500).json({
            message: "Internal server error while fetching books",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

export const getRecommendations = async (request: Request, response: Response) => {
    try {
        const userId = request.user?.id;
        if (!userId || !Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: "Invalid user ID" });
            return;
        }

        // Step 1: Get reviews with ratings >= 4 by this user
        const positiveReviews = await Review.find({ userId, rating: { $gte: 4 } }).populate("bookId");

        // Step 2: Extract genres from the books reviewed positively
        const genreMap: { [key: string]: number } = {}; // Mapeamento de gêneros com frequência
        for (const review of positiveReviews) {
            const book = review.bookId as any; // Type assertion for Book schema
            if (book?.genre) {
                book.genre.forEach((g: string) => {
                    genreMap[g] = (genreMap[g] || 0) + 1; // Incrementa o contador de cada gênero
                });
            }
        }

        const genres = Object.keys(genreMap);
        if (genres.length === 0) {
            response.status(200).json({
                message: "No recommendations available. Try reviewing some books first.",
                books: [],
            });
            return;
        }

        // Step 3: Fetch recommendations diversifying across genres
        let recommendedBooks: any[] = [];
        const booksPerGenre = Math.ceil(10 / genres.length);

        for (const genre of genres) {
            const books = await Book.find({
                genre: genre,
                _id: { $nin: positiveReviews.map((review) => review.bookId) }, // Exclude books the user has reviewed
            })
                .limit(booksPerGenre)
                .exec();
            recommendedBooks = recommendedBooks.concat(books);
        }

        // Step 4: Shuffle the recommendations for randomness
        recommendedBooks = recommendedBooks.sort(() => 0.5 - Math.random()).slice(0, 10);

        // Step 5: Return the list of recommendations
        response.status(200).json({
            message: "Recommendations retrieved successfully",
            books: recommendedBooks,
        });
        return;
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        response.status(500).json({ message: "Internal server error" });
    }
};

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
