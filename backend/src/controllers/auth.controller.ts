import prisma from '../../prisma/client';
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../models/auth/auth.service';
import { logActivity } from '../utils/logger';
import { encrypt, decrypt } from '../utils/crypto/crypto';

// Controller to handle user registration
export const register = async (req: Request, res: Response) => {
    if (!req.body.data || typeof req.body.data !== 'string') {
        return res.status(400).json({ message: 'Missing or invalid encrypted data payload' });
    }

    let parsed;
    try {
        const decrypted = decrypt(req.body.data);
        parsed = JSON.parse(decrypted);
    } catch (err) {
        return res.status(400).json({ message: 'Unable to decrypt or parse data' });
    }

    const { email, password } = parsed;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password' });
    }
    try {
        // Use service function to register user
        const newUser = await registerUser(email, password);

        await logActivity({
            userId: newUser.id,
            action: 'CREATE',
            entity: 'User',
            detail: `ผู้ใช้สมัครสมาชิกด้วยอีเมล ${newUser.email}`
        });

        // Respond with the new user's id and email
        const encryptedResponse = encrypt(JSON.stringify({ id: newUser.id, email: newUser.email }));
        res.status(201).json({ data: encryptedResponse });
    } catch (error) {
        console.error('[register ERROR]', error);
        if (error instanceof Error && error.message === 'User already exists') {
            return res.status(400).json({ message: error.message });
        }
        // Handle server errors
        res.status(500).json({ message: 'Server error', error });
    }
};

// Controller to handle user login
export const login = async (req: Request, res: Response) => {
    if (!req.body.data || typeof req.body.data !== 'string') {
        return res.status(400).json({ message: 'Missing or invalid encrypted data payload' });
    }

    let parsed;
    try {
        const decrypted = decrypt(req.body.data);
        parsed = JSON.parse(decrypted);
    } catch (err) {
        return res.status(400).json({ message: 'Unable to decrypt or parse data' });
    }

    const { email, password } = parsed;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password' });
    }
    try {
        // Use service function to login user
        const { user, token } = await loginUser(email, password);

        await logActivity({
            userId: user.id,
            action: 'CREATE',
            entity: 'Auth',
            detail: `ผู้ใช้ล็อกอินด้วยอีเมล ${user.email}`
        });

        // Respond with the token
        const encryptedResponse = encrypt(JSON.stringify({ token }));
        res.json({ data: encryptedResponse });
    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        if (error instanceof Error && error.message === 'Invalid credentials') {
            return res.status(401).json({ message: error.message });
        }
        // Handle server errors
        res.status(500).json({ message: 'Server error', error });
    }
};

// Controller to get the current authenticated user's information
export const getMe = async (req: Request, res: Response) => {
    let userId = (req as any).userId;

    // Optional: allow encrypted request in the future
    if (req.body?.data && typeof req.body.data === 'string') {
        try {
            const decrypted = decrypt(req.body.data);
            const parsed = JSON.parse(decrypted);
            if (parsed.userId) {
                userId = parsed.userId;
            }
        } catch {
            return res.status(400).json({ message: 'Unable to decrypt or parse data (optional payload)' });
        }
    }

    try {
        // Retrieve user data by id, excluding sensitive information
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Log the activity of fetching user data
        await logActivity({
            userId,
            action: 'READ',
            entity: 'User',
            detail: `ดึงข้อมูลผู้ใช้ปัจจุบัน`
        });

        // Respond with user data
        const encryptedResponse = encrypt(JSON.stringify(user));
        res.json({ data: encryptedResponse });
    } catch (error) {
        console.error('[getMe ERROR]', error);
        // Handle server errors
        res.status(500).json({ message: 'Server error', error });
    }
};