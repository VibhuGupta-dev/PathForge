import jwt from 'jsonwebtoken';
import userModel from '../models/user-model.js';

export const authMiddleware = async (req, res, next) => {
    try {
        // Check token in cookies
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request
        const user = await userModel.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid user' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    }
};
export default authMiddleware;