const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        image: {
            type: String,
            default: "",
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        shopId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        customerName: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            default: "",
        },

        deliveryLocation: {
            type: String,
            required: true,
        },

        room: {
            type: String,
            default: "",
        },

        instructions: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "Order Placed",
                "Accepted",
                "Preparing",
                "Out for Delivery",
                "Delivered",
                "Cancelled",
            ],
            default: "Order Placed",
        },

        paymentMethod: {
            type: String,
            enum: ["Cash on Delivery", "Online"],
            default: "Cash on Delivery",
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending",
        },

        eta: {
            type: String,
            default: "20–30 minutes",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);