const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        image: {
            type: String,
            default: "",
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: ["food", "stationery"],
            required: true,
        },

        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },

        available: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);