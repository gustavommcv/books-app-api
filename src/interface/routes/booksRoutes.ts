import express from 'express';
import { getBook, getBooks, postBook } from '../controllers/booksController';
import { body, param } from 'express-validator';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware } from '../../middlewares/authMiddleware';
import authorizeAdmin from '../../middlewares/authorizeAdmin';

const booksRouter = express.Router();

booksRouter.get('/', getBooks);

// GET a book by ID with validation
booksRouter.get('/:bookId', 
    param('bookId').isMongoId().withMessage('Invalid book ID format'),
    validateRequest,
    getBook
);

// POST to create a book with input validation
booksRouter.post('/', 
    authMiddleware,
    authorizeAdmin,
    [
    // Validate title
    body('title')
        .exists().withMessage('Title is required')
        .notEmpty().withMessage('Title cannot be empty')
        .isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),

    // Validate author
    body('author')
        .exists().withMessage('Author is required')
        .notEmpty().withMessage('Author cannot be empty')
        .isLength({ min: 2, max: 100 }).withMessage('Author must be between 2 and 100 characters'),

    // Validate description
    body('description')
        .exists().withMessage('Description is required')
        .notEmpty().withMessage('Description cannot be empty')
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),

    // Validate genre as an array of strings
    body('genre')
        .exists().withMessage('Genre is required')
        .isArray({ min: 1 }).withMessage('Genre must be an array with at least one genre')
        .custom((genres) => {
            if (!genres.every((g: string) => typeof g === 'string')) {
                throw new Error('Each genre must be a string');
            }
            return true;
        }),

    // Validate publication date
    body('publicationDate')
        .exists().withMessage('Publication date is required')
        .isISO8601().withMessage('Publication date must be a valid ISO 8601 date'),

    // Validate cover URL
    body('cover')
        .exists().withMessage('Cover URL is required')
        .notEmpty().withMessage('Cover URL cannot be empty')
        .isURL().withMessage('Cover must be a valid URL'),

    // Validate page count
    body('pageCount')
        .exists().withMessage('Page count is required')
        .isInt({ min: 1 }).withMessage('Page count must be a positive integer'),

    validateRequest // Middleware to handle validation errors
], postBook);

export default booksRouter;
