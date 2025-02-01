// Using express-validator: https://express-validator.github.io/docs/
///////////////////////////////////////////////////////////////////////////////////
import { body } from 'express-validator';
import express from 'express';
import { postLogin, postSignup } from '../controllers/authController';

///////////////////////////////////////////////////////////////////////////////////
// Create an instance of an Express router
///////////////////////////////////////////////////////////////////////////////////
const authRouter = express.Router();

///////////////////////////////////////////////////////////////////////////////////
// POST /login route with validation middleware
///////////////////////////////////////////////////////////////////////////////////
authRouter.post('/login', [
    // Validate the email field
    body('email')
        .exists().withMessage('You need to provide an email adress')
        .isEmail().withMessage('You need to provide an valid email adress')
        .normalizeEmail(),

    // Validate the password field
    body('password')
        .exists().withMessage('You need to provide an password')
        .notEmpty().withMessage('Your password cannot be empty')
        .isLength({ min: 6, max: 100 }).withMessage('Password must be at least 6 characters long, and a maximum of 100 characters')
], postLogin); // Pass the request to the postLogin controller after validation

///////////////////////////////////////////////////////////////////////////////////
// POST /signup route with validation middleware
///////////////////////////////////////////////////////////////////////////////////
authRouter.post('/signup', [
    // Validate the user name field
    body('userName')
        .exists().withMessage('You need to provide an user name')
        .notEmpty().withMessage('Your user name cannot be empty'),

    // Validate the email field
    body('email')
        .exists().withMessage('You need to provide an email adress')
        .isEmail().withMessage('You need to provide an valid email adress')
        .normalizeEmail(),

    // Validate the password field
    body('password')
        .exists().withMessage('You need to provide an password')
        .notEmpty().withMessage('Your password cannot be empty')
        .isLength({ min: 6, max: 100 }).withMessage('Password must be at least 6 characters long, and a maximum of 100 characters')
], postSignup); // Pass the request to the postSignup controller after validation

export default authRouter;
