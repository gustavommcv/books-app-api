import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

declare module 'express' {
    export interface Request {
        user?: string | JwtPayload; // User type
    }
}
