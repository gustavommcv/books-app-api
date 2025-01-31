import { Request, Response } from 'express';
import { matchedData, validationResult } from "express-validator";

// Define the postLogin controller function
export const postLogin = async (request: Request, response: Response): Promise<void> => {
    // Validate the request and check for errors
    const errorsResult = validationResult(request);

    // If there are validation errors, return a 400 status with the errors
    if (!errorsResult.isEmpty()) {
        response.status(400).json({ errors: errorsResult.array() });
        return;
    };

    // Extract validated data from the request using matchedData
    const { email, password } = matchedData(request);

    try {
        // Simulate a successful login and return a 200 status with a success message
        response.status(200).json({ message: 'Login Successful', email, password });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal server error' })
    }
}
