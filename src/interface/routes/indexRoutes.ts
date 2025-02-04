import express from 'express';
import authRouter from './authRoutes';
import booksRouter from './booksRoutes';
import commentsRoutes from './commentsRoutes';
import reviewsRoutes from './reviewsRoutes';
import userRoutes from './userRoutes';

const indexRouter = express.Router();

// Welcome endpoint with an overview of the API
indexRouter.get('/', (request, response) => {
  response.json({
    message: "Welcome to the BooksApp API!",
    description: "Explore the available API endpoints below.",
    endpoints: {
      auth: {
        "/api/auth/login": "POST - Login with email and password",
        "/api/auth/signup": "POST - Register a new user",
        "/api/auth/verify-email": "GET - Verify user email using token",
        "/api/auth/logout": "POST - Logout current user"
      },
      books: {
        "/api/books": "GET - Fetch a paginated list of books with filters",
        "/api/books/:bookId": "GET - Retrieve details of a specific book by ID",
        "/api/books/recommendations": "GET - Personalized book recommendations for the logged-in user"
      },
      reviews: {
        "/api/reviews/user": "GET - Get all reviews made by the logged-in user",
        "/api/reviews/book/:bookId": "GET - Get reviews for a specific book",
        "/api/reviews/:reviewId": "GET - Get a specific review by its ID",
        "/api/reviews": "POST - Create a new review"
      },
      users: {
        "/api/user/profile": "GET - Get the logged-in user's profile",
        "/api/user/profile/:userId": "GET - Get a user profile by ID",
        "/api/user/profile/": "PUT - Update the logged-in user's profile"
      },
      comments: {
        "/api/comments/user": "GET - Get all comments made by the logged-in user",
        "/api/comments/review/:reviewId": "GET - Get comments for a specific review",
        "/api/comments/:commentId": "GET - Get a comment by its ID",
        "/api/comments": "POST - Create a new comment"
      }
    }
  });
});

indexRouter.use('/auth', authRouter);
indexRouter.use('/books', booksRouter);
indexRouter.use('/reviews', reviewsRoutes);
indexRouter.use('/comments', commentsRoutes);
indexRouter.use('/user', userRoutes);

export default indexRouter;
