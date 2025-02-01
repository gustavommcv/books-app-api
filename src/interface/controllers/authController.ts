import { Request, Response } from 'express';
import { matchedData, validationResult } from "express-validator";
import User from '../../entities/User';

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
        const userName = user.userName;

        // If successful, return a 200 status with a success message and the user data
        response.status(200).json({ message: 'Login Successful', userName });
    } catch (error) {
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

        // Create a new user instance with the validated data
        const newUser = new User({ userName, email, password });

        // Save the new user to the database
        newUser.save();

        // If successful, return a 200 status with a success message and the new user data
        response.status(200).json({ message: 'Signup Successful', userName });
    } catch (error) {
        // If an error occurs, return a 500 status with a generic error message
        response.status(500).json({ message: 'Internal server error' });
    }
}
