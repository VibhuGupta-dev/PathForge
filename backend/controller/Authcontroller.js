import Joi from 'joi';
import userModel from '../models/Usermodel.js';
import{ createUser }from '../utils/GenerateUser.js'
import generateToken from '../utils/GenerateToken.js';

export const Registeruser = async function (req, res) {
    try {
        console.log('req.body:', req.body);

        const schema = Joi.object({
            Fullname: Joi.string().required().messages({
                'string.empty': 'Fullname is required',
            }),
            email: Joi.string().email().required().messages({
                'string.email': 'Please enter a valid email address',
                'string.empty': 'Email is required',
            }),
            password: Joi.string().min(6).required().messages({
                'string.min': 'Password must be at least 6 characters',
                'string.empty': 'Password is required',
            }),
            contact: Joi.number().required().messages({
                'number.base': 'Contact must be a valid number',
                'any.required': 'Contact is required',
            }),
        });

        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({ success: false, errors: errorMessages });
        }

        const { Fullname, email, password, contact } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const user = await createUser({
            Fullname,
            email,
            password,
            contact
        });

        const token = generateToken(user);

        // send token in cookie (secure way)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                Fullname: user.Fullname,
                email: user.email,
                contact: user.contact
            },
            token
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const loginuser = async function (req, res) {
    try {
        console.log('loginuser req.body:', req.body);

        const schema = Joi.object({
            email: Joi.string().email().required().messages({
                'string.email': 'Please enter a valid email address',
                'string.empty': 'Email is required',
            }),
            password: Joi.string().required().messages({
                'string.empty': 'Password is required',
            }),
        });

        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { email, password } = req.body;

        const user = await userModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                Fullname: user.Fullname,
                email: user.email,
                contact: user.contact
            },
            token
        });
    } catch (err) {
        console.error('loginuser error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const logout = function (req, res) {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        if (req.session) {
            req.session.destroy(() => {
                return res.status(200).json({ success: true, message: 'Logged out successfully' });
            });
        } else {
            return res.status(200).json({ success: true, message: 'Logged out successfully' });
        }
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
