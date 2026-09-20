const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        {
            id: userId,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};


// ===============================
// CUSTOMER REGISTRATION
// ===============================
router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required.",
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase(),
        });

        if (existingUser) {
            return res.status(400).json({
                message: "An account with this email already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone: phone || "",
            password: hashedPassword,
            role: "customer",
        });

        const token = generateToken(user._id);

        res.status(201).json({
            message: "Registration successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                shopId: user.shopId,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error during registration.",
        });
    }
});


// ===============================
// LOGIN
// ===============================
router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account is inactive.",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const token = generateToken(user._id);

        res.json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                shopId: user.shopId,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login.",
        });
    }
});


module.exports = router;