import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Extend the Express Request interface to include an optional userId property
interface AuthRequest extends Request {
    userId?: number;
}

/**
 * Middleware to verify JWT token from the Authorization header.
 * It checks if the token is provided and valid, then attaches the userId to the request object.
 * If the token is missing or invalid, it responds with a 401 Unauthorized status.
 */
const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Extract the Authorization header
    const authHeader = req.headers.authorization;
    // Check if the header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];
    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        // Attach the userId to the request object for use in subsequent middleware/routes
        req.userId = decoded.userId;
        next();
    } catch (error) {
        // If token verification fails, respond with 401 Unauthorized
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default verifyToken;