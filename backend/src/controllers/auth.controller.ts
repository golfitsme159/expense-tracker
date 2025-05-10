import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import prisma from '../../prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Controller to handle user registration
export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user in the database
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        // Respond with the new user's id and email
        res.status(201).json({ id: newUser.id, email: newUser.email });
    } catch (error) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error });
    }
};

// Controller to handle user login
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate JWT token for authenticated user
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        // Respond with the token
        res.json({ token });
    } catch (error) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error });
    }
};

// Controller to get the current authenticated user's information
export const getMe = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    try {
        // Retrieve user data by id, excluding sensitive information
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Respond with user data
        res.json(user);
    } catch (error) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error });
    }
};