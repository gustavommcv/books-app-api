import express from 'express';
import authRouter from './authRoutes';
import booksRouter from './booksRoutes';
import commentsRoutes from './commentsRoutes';
import reviewsRoutes from './reviewsRoutes';
import userRoutes from './userRoutes';

const indexRouter = express.Router();

indexRouter.get('/', (request, response) => {
  response.json({
      message: "Welcome to the BooksApp API!",
      description: "Explore the available API endpoints below.",
      endpoints: {
          "/api/auth/login": "POST - Login with email and password",
          "/api/auth/signup": "POST - Register a new user",
          "/api/auth/verify-email": "GET - Verify user email using token",
          "/api/auth/logout": "POST - Logout current user",
          "/api/books": "GET - Fetch a paginated list of books",
          "/api/books/:bookId": "GET - Retrieve details of a specific book by ID",
      }
  });
});

indexRouter.use('/auth', authRouter);
indexRouter.use('/books', booksRouter);
indexRouter.use('/reviews', reviewsRoutes);
indexRouter.use('/comments', commentsRoutes);
indexRouter.use('/user', userRoutes);

export default indexRouter;
