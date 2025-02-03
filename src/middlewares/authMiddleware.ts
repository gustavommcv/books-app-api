import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
    id: string;
    email: string;
    role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware for authenticating the user
export const authMiddleware = (request: Request, response: Response, next: NextFunction) => {
    const token = request.cookies.authToken;

    if (!token) {
        response.status(401).json({ message: 'Authentication required' });
        return
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;

        // Attach user to the request object
        request.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        response.clearCookie('authToken');
        response.status(403).json({ message: 'Invalid or expired token' });
        return;
    }
};
