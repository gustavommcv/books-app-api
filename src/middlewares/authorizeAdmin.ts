import { Request, Response, NextFunction } from 'express';

// Middleware to authorize admin users
const authorizeAdmin = (request: Request, response: Response, next: NextFunction) => {
    if (request.user && request.user.role === 'admin') {
        return next(); // User is an admin, continue to the next middleware/controller
    }

    // If not an admin, return a 403 Forbidden response
    response.status(403).json({
        message: 'Access denied. Only administrators can perform this action.'
    });
};

export default authorizeAdmin;
