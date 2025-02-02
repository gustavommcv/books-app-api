import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// TODO - Authorization for admin users
export const authMiddleware = (request: Request, response: Response, next: NextFunction) => {
    const token = request.cookies.authToken;

    if (!token) {
        return response.status(401).json({ message: 'Authentication required' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        request.user = decoded; // Decoded user stored on the Request
        next(); // Allows that the next function continues
    } catch (error) {
        response.clearCookie('authToken'); // Clears the cookie
        return response.status(403).json({ message: 'Invalid or expired token' });
    }
}
