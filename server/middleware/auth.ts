import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { storage } from '../storage';

// Get JWT secret from environment variable or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-for-development';

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if it's Bearer token or Basic auth
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user = await storage.getUser(decoded.userId);
        
        if (!user) {
          return res.status(401).json({ message: 'Invalid token' });
        }
        
        // Attach user to request
        (req as any).user = user;
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    } else if (authHeader.startsWith('Basic ')) {
      // Handle Client ID + Client Secret authentication
      const base64Credentials = authHeader.substring(6);
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [clientId, clientSecret] = credentials.split(':');
      
      const user = await storage.getUserByClientId(clientId);
      
      if (!user || user.clientSecret !== clientSecret) {
        return res.status(401).json({ message: 'Invalid client credentials' });
      }
      
      // Attach user to request
      (req as any).user = user;
      next();
    } else {
      return res.status(401).json({ message: 'Unsupported authentication method' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Login function for generating JWT tokens
export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Password verification
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
