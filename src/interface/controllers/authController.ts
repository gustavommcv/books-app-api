import { Request, Response } from 'express';
import { matchedData, validationResult } from "express-validator";
import nodemailer from 'nodemailer';
import 'dotenv/config'; // Filling process.env with .env values
import crypto from 'crypto'; // To generate a validation token

import User from '../../entities/User';

const PORT = process.env.PORT || 3000;
const API_EMAIL = process.env.API_EMAIL;
const API_EMAIL_PASSWORD = process.env.API_EMAIL_PASSWORD

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: API_EMAIL,
        pass: API_EMAIL_PASSWORD
    }
});

const sendVerificationEmail = async (email:string, token:string) => {
    const verificationLink = `https://localhost:${PORT}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: API_EMAIL,
        to: email,
        subject: 'Email confirmation',
        html: `<p>Hello, please verify your e-mail adress clicking on the link bellow:</p>
                <a href="${verificationLink}">Verify E-mail</a>`
    }

    await transporter.sendMail(mailOptions);
}

// Define the postLogin controller function
export const postLogin = async (request: Request, response: Response): Promise<void> => {
    // Validate the request and check for errors using express-validator
    const errorsResult = validationResult(request);

    // If there are validation errors, return a 400 status with the errors
    if (!errorsResult.isEmpty()) {
        response.status(400).json({ errors: errorsResult.array() });
        return;
    };

    // Extract validated data from the request using matchedData
    const { email, password } = matchedData(request);

    try {
        // Attempt to log in the user using the User model's login method
        const user = await User.login(email, password);
        
        if (!user.isEmailVerified) {
            response.status(403).json({ message: 'Please, verify your email before logging in' });
            return;
        }

        const userName = user.userName;

        // If successful, return a 200 status with a success message and the user data
        response.status(200).json({ message: 'Login Successful', userName });
    } catch (error) {
        console.error(error);
        // If an error occurs, handle it appropriately
        if (error instanceof Error) {
            // Check the error message and return the appropriate status code and message
            if (error.message === "User not found") {
                response.status(404).json({ message: error.message });
            } else if (error.message === "Invalid credentials") {
                response.status(401).json({ message: error.message });
            } else {
                // For any other error, return a 500 status with a generic error message
                response.status(500).json({ message: 'Internal server error' });
            }
        }
    }
}

// Define the postSignup controller function
export const postSignup = async (request: Request, response: Response): Promise<void> => {
    // Validate the request and check for errors using express-validator
    const errorsResult = validationResult(request);

    // If there are validation errors, return a 400 status with the errors
    if (!errorsResult.isEmpty()) {
        response.status(400).json({ errors: errorsResult.array() });
        return;
    };

    // Extract validated data from the request using matchedData
    const { userName, email, password } = matchedData(request);

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            response.status(400).json({ message: 'Email is already in use' });
            return;
        }

        // Generates a new verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Create a new user instance with the validated data
        const newUser = new User({ 
            userName, 
            email, 
            password,
            isEmailVerified: false,
            emailVerificationToken: verificationToken
        });

        // Save the new user to the database
        newUser.save();

        // Sends the verification email
        await sendVerificationEmail(email, verificationToken);

        // If successful, return a 200 status with a success message and the new user data
        response.status(200).json({ message: 'Signup Successful. Please check your email for verification.', userName });
    } catch (error) {
        console.error(error);
        // If an error occurs, return a 500 status with a generic error message
        response.status(500).json({ message: 'Internal server error' });
    }
}

// Define the verifyEmail controller function
export const verifyEmail = async (request: Request, response: Response): Promise<void> => {
    const token = request.query.token as string;

    if (!token) {
        response.status(400).json({ message: 'Token is missing or invalid' });
        return;
    }

    try {
        // Searches the user based on the token
        const user = await User.findOne({ emailVerificationToken: token });

        if (!user) {
            response.status(400).json({ message: 'Invalid token or user not found' });
            return;
        }

        // Verify e-mail
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined; // Clear the token after validation
        await user.save();

        response.status(200).json({ message: `Email ${user.email} successfully verified` });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal server error' });
    }
}
