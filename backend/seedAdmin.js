const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        const existingAdmin = await User.findOne({
            email: "admin@coermart.com",
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            await mongoose.connection.close();
            return;
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        const admin = await User.create({
            name: "COERMart Admin",
            email: "admin@coermart.com",
            phone: "",
            password: hashedPassword,
            role: "admin",
            shopId: null,
            isActive: true,
        });

        console.log("Admin created successfully.");
        console.log(`Email: ${admin.email}`);
        console.log("Password: admin123");

        await mongoose.connection.close();

        console.log("Database connection closed");
    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};

seedAdmin();