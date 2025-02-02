import express from 'express';
import { getBook, getBooks } from '../controllers/booksController';
import { param } from 'express-validator';
import validateRequest from '../../middlewares/validateRequest';

const booksRouter = express.Router();

booksRouter.get('/', getBooks);

booksRouter.get('/:bookId', 
    param('bookId').isMongoId().withMessage('Invalid book ID format'),
    validateRequest
, getBook);

export default booksRouter;
