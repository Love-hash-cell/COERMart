
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const Shop = require("./models/Shop");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shopRoutes = require("./routes/shopRoutes");

dotenv.config();

const app = express();

// Create HTTP server for Express + Socket.IO
const server = http.createServer(app);

// Allowed frontend URL
const FRONTEND_URL =
    process.env.FRONTEND_URL || "http://localhost:5173";

// CORS configuration
const corsOptions = {
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
};

// Express CORS
app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json());

// Socket.IO
const io = new Server(server, {
    cors: corsOptions,
});

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-order", (orderId) => {
        socket.join(`order:${orderId}`);
        console.log(`Socket ${socket.id} joined order:${orderId}`);
    });

    socket.on("join-shop", (shopId) => {
        socket.join(`shop:${shopId}`);
        console.log(`Socket ${socket.id} joined shop:${shopId}`);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

// Make io available to routes
app.set("io", io);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "COERMart Backend API is running",
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shops", shopRoutes);

// Get all shops
app.get("/api/shops", async (req, res) => {
    try {
        const shops = await Shop.find().select(
            "_id name type ownerId"
        );

        res.json(shops);
    } catch (error) {
        console.error("Error fetching shops:", error);

        res.status(500).json({
            message: "Error fetching shops",
        });
    }
});

// Port
const PORT = process.env.PORT || 5000;

// Start server only after MongoDB connection
const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(
                `COERMart Backend running on port ${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();