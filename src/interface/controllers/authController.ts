import { Request, Response } from 'express';
import { matchedData, validationResult } from "express-validator";
import nodemailer from 'nodemailer';
import 'dotenv/config'; // Filling process.env with .env values
import crypto from 'crypto'; // To generate an e-mail validation token
import jwt from 'jsonwebtoken';

import User from '../../entities/User';

const PORT = process.env.PORT || 3000;
const API_EMAIL = process.env.API_EMAIL;
const API_EMAIL_PASSWORD = process.env.API_EMAIL_PASSWORD

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = '1d'; // Token is valid for 1 day

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: API_EMAIL,
        pass: API_EMAIL_PASSWORD
    },
    // logger: true,
    // debug: true
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to SMTP server:', error);
    } else {
        console.log('SMTP server is ready to take messages');
    }
});

const sendVerificationEmail = async (email: string, token: string) => {
    const verificationLink = `https://localhost:${PORT}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
        from: API_EMAIL,
        to: email,
        subject: 'Verify Your Email - BooksApp',
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #4CAF50;">Welcome to BooksApp!</h2>
                <p>Hello,</p>
                <p>Thank you for signing up with <strong>BooksApp</strong>. Please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center; margin: 20px;">
                    <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">Verify My Email</a>
                </div>

                <p>If you did not create this account, please ignore this email.</p>
                <p>Thank you,</p>
                <p>The <strong>BooksApp</strong> Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', email);
    } catch (error) {
        console.error('Failed to send email:', error);
        throw new Error('Failed to send verification email'); 
    }
};

// Define the postLogin controller function
export const postLogin = async (request: Request, response: Response): Promise<void> => {
    // Verifies if there is a JWT valid on cookie
    const existingToken = request.cookies.authToken;

    if (existingToken) {
        try {
            // Try to validate the token
            const decoded = jwt.verify(existingToken, JWT_SECRET);
            
            // if the token is valid, sends the response
            response.status(200).json({
                message: 'You are already logged in',
                user: decoded
            });
            return;
        } catch (error) {
            // If the token is expired or invalid, continues with the normal login process
            console.warn('Invalid or expired token, processing login again.');
            response.clearCookie('authToken'); // Clears the cookie
        }
    }

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

        // Generates the JWT token
        const token = jwt.sign(
            {
                id: user._id,
                userName: user.userName,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN
            }
        );

        response.cookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day
        });

        // If successful, return a 200 status with a success message and the user data
        response.status(200).json({ message: 'Login Successful', token, user: { userName: user.userName, email: user.email } });
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
    const existingToken = request.cookies.authToken;
    
    // Verifies if the user is logged in
    if (existingToken) {
        try {
            // If it is an valid token, stops the sign in process
            jwt.verify(existingToken, JWT_SECRET);
            response.status(400).json({
                message: 'You are already logged in. Logout first to create a new account.'
            });
            return 
        } catch (error) {
            // If it is an invalid token, continues with the process of sign up
            console.warn('Invalid or expired token during signup check.');
            response.clearCookie('authToken'); // Clears the cookie
        }
    }

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
        await newUser.save();

        // Sends the verification email
        try {
            await sendVerificationEmail(email, verificationToken);
            // If successful, return a 200 status with a success message and the new user data
            response.status(200).json({
                message: 'You’ve successfully signed up! Please check your email to verify your account. Don’t forget to check your spam folder if it’s not in your inbox.',
                userName
            });
        } catch (error) {
            console.error('Error sending verification email:', error);

            await User.findByIdAndDelete(newUser._id);
            response.status(500).json({
                message: 'Failed to send verification email. Please try again later.'
            });
        }
    } catch (error) {
        console.error(error);
        // If an error occurs, return a 500 status with a generic error message
        response.status(500).json({ message: 'Internal server error' });
    }
}

export const logout = (request: Request, response: Response) => {
    const token = request.cookies.authToken;

    if (!token) {
        response.status(400).json({ message: 'You are already logged out' });
        return;
    }

    response.clearCookie('authToken');

    response.status(200).json({ message: 'Logout sucessful' });
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
