
const express = require("express");

const Product = require("../models/Product");
const Shop = require("../models/Shop");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all available products - PUBLIC
router.get("/", async (req, res) => {
    try {
        const products = await Product.find({
            available: true,
        }).sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        console.error("Get all products error:", error);

        res.status(500).json({
            message: "Server error while fetching products.",
        });
    }
});

// Add a product
router.post(
    "/",
    protect,
    authorize("shop_owner"),
    async (req, res) => {
        try {
            const {
                name,
                description,
                price,
                image,
                category,
            } = req.body;

            if (!name || price === undefined || !category) {
                return res.status(400).json({
                    message: "Name, price and category are required.",
                });
            }

            const shop = await Shop.findById(req.user.shopId);

            if (!shop) {
                return res.status(404).json({
                    message: "Shop not found.",
                });
            }

            const product = await Product.create({
                name,
                description: description || "",
                price: Number(price),
                image: image || "",
                category,
                type: shop.type,
                shopId: shop._id,
                available: true,
            });

            // Real-time notification for customers
            const io = req.app.get("io");

            if (io) {
                io.emit("product-created", {
                    product,
                });
            }

            res.status(201).json({
                message: "Product added successfully.",
                product,
            });
        } catch (error) {
            console.error("Add product error:", error);

            res.status(500).json({
                message: "Server error while adding product.",
            });
        }
    }
);

// Get products of logged-in shop owner
router.get(
    "/my-products",
    protect,
    authorize("shop_owner"),
    async (req, res) => {
        try {
            const products = await Product.find({
                shopId: req.user.shopId,
            }).sort({ createdAt: -1 });

            res.json(products);
        } catch (error) {
            console.error("Get products error:", error);

            res.status(500).json({
                message: "Server error while fetching products.",
            });
        }
    }
);

// Delete a product
router.delete(
    "/:id",
    protect,
    authorize("shop_owner"),
    async (req, res) => {
        try {
            const product = await Product.findOne({
                _id: req.params.id,
                shopId: req.user.shopId,
            });

            if (!product) {
                return res.status(404).json({
                    message:
                        "Product not found or you do not own this product.",
                });
            }

            await Product.findByIdAndDelete(product._id);

            // Real-time notification for customers
            const io = req.app.get("io");

            if (io) {
                io.emit("product-deleted", {
                    productId: product._id,
                    shopId: product.shopId,
                });
            }

            res.json({
                message: "Product deleted successfully.",
            });
        } catch (error) {
            console.error("Delete product error:", error);

            res.status(500).json({
                message: "Server error while deleting product.",
            });
        }
    }
);

module.exports = router;