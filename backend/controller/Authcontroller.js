import express from "express";
import User from "../models/Usermodel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();


export const register = (req, res) => {
    // Registration logic here
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    newUser.save()
        .then(() => {
            res.json({ message: "User registered successfully" });
        })
        .catch((error) => {
            console.error("❌ User registration failed:", error);
            res.status(500).json({ error: "User registration failed" });
        });
};

export const login = (req, res) => {
  // Login logic here
  res.json({ message: "User logged in successfully" });
}

export const logout = (req, res) => {
  // Logout logic here
  res.json({ message: "User logged out successfully" });
}