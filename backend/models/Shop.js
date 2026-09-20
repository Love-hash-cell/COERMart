const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        type: {
            type: String,
            enum: ["food", "stationery"],
            required: true,
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        description: {
            type: String,
            default: "",
        },

        location: {
            type: String,
            default: "COER University Campus",
        },

        phone: {
            type: String,
            default: "",
        },

        isOpen: {
            type: Boolean,
            default: true,
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

module.exports = mongoose.model("Shop", shopSchema);