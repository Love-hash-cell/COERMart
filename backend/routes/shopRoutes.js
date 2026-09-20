const express = require("express");
const Shop = require("../models/Shop");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET ALL SHOPS
// Public
// =====================================================
router.get("/", async (req, res) => {
    try {
        const shops = await Shop.find({ isActive: true }).sort({
            createdAt: 1,
        });

        res.json(shops);
    } catch (error) {
        console.error("Fetch shops error:", error);

        res.status(500).json({
            message: "Failed to fetch shops.",
        });
    }
});

// =====================================================
// CREATE NEW SHOP
// Admin only
// =====================================================
router.post(
    "/admin",
    protect,
    authorize("admin"),
    async (req, res) => {
        try {
            const {
                name,
                type,
                description,
                location,
                phone,
            } = req.body;

            // Validate shop name
            if (!name || !name.trim()) {
                return res.status(400).json({
                    message: "Shop name is required.",
                });
            }

            // Validate shop type
            if (!["food", "stationery"].includes(type)) {
                return res.status(400).json({
                    message: "Shop type must be food or stationery.",
                });
            }

            // Check duplicate shop name
            const existingShop = await Shop.findOne({
                name: name.trim(),
            });

            if (existingShop) {
                return res.status(400).json({
                    message: "A shop with this name already exists.",
                });
            }

            const shop = await Shop.create({
                name: name.trim(),
                type,
                description: description || "",
                location: location || "COER University Campus",
                phone: phone || "",
                ownerId: null,
                isOpen: true,
                isActive: true,
            });

            res.status(201).json({
                message: "Shop created successfully.",
                shop,
            });
        } catch (error) {
            console.error("Create shop error:", error);

            res.status(500).json({
                message: "Failed to create shop.",
            });
        }
    }
);

module.exports = router;