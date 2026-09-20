const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        const hashedPassword = await bcrypt.hash("amul123", 10);

        const user = await User.findOneAndUpdate(
            { email: "amul@coermart.com" },
            {
                password: hashedPassword,
                role: "shop_owner",
                shopId: "6aa97a23bbb19ba31a570c29",
                isActive: true,
            },
            { new: true }
        );

        if (!user) {
            console.log("Amul Owner account not found.");
        } else {
            console.log("Amul Owner updated successfully.");
            console.log("Email: amul@coermart.com");
            console.log("Password: amul123");
            console.log("Role:", user.role);
            console.log("Shop ID:", user.shopId);
        }

        await mongoose.connection.close();
        console.log("Database connection closed");
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

resetPassword();