const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            default: "",
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["customer", "shop_owner", "admin"],
            default: "customer",
        },

        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);