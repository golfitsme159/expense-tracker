import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 นาที
    max: 5,              // จำกัด 5 requests ต่อ IP ต่อ 1 นาที
    message: { message: 'Too many login attempts, please try again later' },
});