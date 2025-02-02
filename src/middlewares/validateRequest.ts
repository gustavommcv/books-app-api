import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Middleware to check for validation errors and return them as JSON if present
// OPTIONAL -> Apply this middleware to authRoutes to make the controller shorter
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return; // Explicitly return to avoid further execution
    }
    next(); // Continue to the next middleware if no errors
};

export default validateRequest;
