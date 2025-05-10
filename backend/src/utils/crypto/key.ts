import dotenv from 'dotenv';
dotenv.config();

// Load AES key from environment
export const AES_SECRET_KEY = process.env.AES_SECRET_KEY || 'default_32_char_key_1234567890123456';
