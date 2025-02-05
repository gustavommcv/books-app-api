import { Request, Response } from "express";
import Book from "../../entities/Book";
import Review from "../../entities/Review";
import { Types } from "mongoose";

export const getBooks = async (request: Request, response: Response) => {
    try {
        const { random, limit = 10 } = request.query;

        if (random === "true") {
            const sampleSize = Math.min(parseInt(limit as string) || 10, 100);

            const books = await Book.aggregate([{ $sample: { size: sampleSize } }]);

            response.status(200).json({
                message: "Random books retrieved successfully",
                books,
            });
            return;
        }

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
            filters.genre = genre;
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

        const page = parseInt(request.query.page as string) || 1;
        const itemsPerPage = parseInt(request.query.limit as string) || 10;
        const sortField = (sort as string) || "title";
        const sortOrder = order === "desc" ? -1 : 1;

        const books = await Book.find(filters)
            .sort({ [sortField]: sortOrder })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const totalBooks = await Book.countDocuments(filters);

        response.status(200).json({
            message: "Books retrieved successfully",
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalBooks / itemsPerPage),
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
        const limit = parseInt(request.query.limit as string) || 10; // Default limit is 10

        // Validate the user ID
        if (!userId || !Types.ObjectId.isValid(userId)) {
            response.status(400).json({ message: "Invalid user ID" });
            return;
        }

        // Step 1: Fetch positive reviews (rating >= 4) from the user
        const positiveReviews = await Review.find({ userId, rating: { $gte: 4 } }).populate('bookId');

        // Step 2: Build a weighted genre map based on user reviews
        const genreMap: { [key: string]: number } = {}; // Keeps track of genres and their frequencies
        for (const review of positiveReviews) {
            const book = review.bookId as any; // Type assertion for Book schema
            if (book?.genre) {
                book.genre.forEach((g: string) => {
                    genreMap[g] = (genreMap[g] || 0) + 1; // Increment the count of each genre
                });
            }
        }

        // If no genres are found, return a message to the user
        const genres = Object.keys(genreMap);
        if (genres.length === 0) {
            response.status(200).json({
                message: "No recommendations available. Try reviewing some books first.",
                books: [],
            });
            return;
        }

        // Step 3: Sort genres by frequency to prioritize them
        genres.sort((a, b) => genreMap[b] - genreMap[a]); // Higher frequency first

        // Step 4: Fetch books across prioritized genres
        let recommendedBooks: any[] = [];

        for (const genre of genres) {
            const books = await Book.find({
                genre: genre,
                _id: { $nin: positiveReviews.map((review) => review.bookId) }, // Exclude books already reviewed
            })
                .limit(limit - recommendedBooks.length) // Dynamically limit based on remaining books needed
                .exec();

            recommendedBooks = recommendedBooks.concat(books);
            if (recommendedBooks.length >= limit) break; // Stop if limit is reached
        }

        // Step 5: If still under the limit, retry fetching from the most frequent genres
        if (recommendedBooks.length < limit) {
            for (const genre of genres) {
                if (recommendedBooks.length >= limit) break;

                const additionalBooks = await Book.find({
                    genre: genre,
                    _id: {
                        $nin: positiveReviews.map((review) => review.bookId)
                            .concat(recommendedBooks.map((book) => book._id)),
                    }, // Exclude books already fetched
                })
                    .limit(limit - recommendedBooks.length) // Fetch only the remaining needed books
                    .exec();

                recommendedBooks = recommendedBooks.concat(additionalBooks);
            }
        }

        // Step 6: Return the list of recommendations
        response.status(200).json({
            message: "Recommendations retrieved successfully",
            books: recommendedBooks.slice(0, limit), // Ensure we return exactly the limit
        });
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
