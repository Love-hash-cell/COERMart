const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Shop = require("../models/Shop");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// CREATE A SHOP OWNER
// =====================================================
router.post(
    "/shop-owner",
    protect,
    authorize("admin"),
    async (req, res) => {
        try {
            const {
                name,
                email,
                phone,
                password,
                shopId,
            } = req.body;

            if (!name || !email || !password || !shopId) {
                return res.status(400).json({
                    message:
                        "Name, email, password and shopId are required.",
                });
            }

            const shop = await Shop.findById(shopId);

            if (!shop) {
                return res.status(404).json({
                    message: "Shop not found.",
                });
            }

            if (shop.ownerId) {
                return res.status(400).json({
                    message: "This shop already has an owner.",
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

            const owner = await User.create({
                name,
                email: email.toLowerCase(),
                phone: phone || "",
                password: hashedPassword,
                role: "shop_owner",
                shopId: shop._id,
                isActive: true,
            });

            shop.ownerId = owner._id;
            await shop.save();

            res.status(201).json({
                message: "Shop owner created successfully.",
                owner: {
                    id: owner._id,
                    name: owner.name,
                    email: owner.email,
                    phone: owner.phone,
                    role: owner.role,
                    shopId: owner.shopId,
                },
                shop: {
                    id: shop._id,
                    name: shop.name,
                    type: shop.type,
                },
            });
        } catch (error) {
            console.error("Create shop owner error:", error);

            res.status(500).json({
                message: "Server error while creating shop owner.",
            });
        }
    }
);

// =====================================================
// GET ALL SHOP OWNERS
// =====================================================
router.get(
    "/shop-owners",
    protect,
    authorize("admin"),
    async (req, res) => {
        try {
            const owners = await User.find({
                role: "shop_owner",
            })
                .select("-password")
                .populate("shopId", "name type");

            res.json(owners);
        } catch (error) {
            console.error("Get shop owners error:", error);

            res.status(500).json({
                message: "Server error while fetching shop owners.",
            });
        }
    }
);

// =====================================================
// UPDATE SHOP OWNER DETAILS
// =====================================================
router.put(
    "/shop-owner/:id",
    protect,
    authorize("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const {
                name,
                email,
                phone,
                shopId,
            } = req.body;

            const owner = await User.findOne({
                _id: id,
                role: "shop_owner",
            });

            if (!owner) {
                return res.status(404).json({
                    message: "Shop owner not found.",
                });
            }

            // Check if email is already used by another account
            if (email && email.toLowerCase() !== owner.email) {
                const existingUser = await User.findOne({
                    email: email.toLowerCase(),
                    _id: { $ne: owner._id },
                });

                if (existingUser) {
                    return res.status(400).json({
                        message:
                            "Another account already uses this email.",
                    });
                }

                owner.email = email.toLowerCase();
            }

            if (name !== undefined) {
                owner.name = name;
            }

            if (phone !== undefined) {
                owner.phone = phone;
            }

            // Change assigned shop
            if (shopId && shopId.toString() !== owner.shopId?.toString()) {
                const newShop = await Shop.findById(shopId);

                if (!newShop) {
                    return res.status(404).json({
                        message: "New shop not found.",
                    });
                }

                if (
                    newShop.ownerId &&
                    newShop.ownerId.toString() !== owner._id.toString()
                ) {
                    return res.status(400).json({
                        message:
                            "This shop already has another owner.",
                    });
                }

                // Remove owner from old shop
                if (owner.shopId) {
                    await Shop.findByIdAndUpdate(
                        owner.shopId,
                        { $unset: { ownerId: "" } }
                    );
                }

                // Assign owner to new shop
                newShop.ownerId = owner._id;
                await newShop.save();

                owner.shopId = newShop._id;
            }

            await owner.save();

            const updatedOwner = await User.findById(owner._id)
                .select("-password")
                .populate("shopId", "name type");

            res.json({
                message: "Shop owner updated successfully.",
                owner: updatedOwner,
            });
        } catch (error) {
            console.error("Update shop owner error:", error);

            res.status(500).json({
                message:
                    "Server error while updating shop owner.",
            });
        }
    }
);

// =====================================================
// RESET SHOP OWNER PASSWORD
// =====================================================
router.put(
    "/shop-owner/:id/password",
    protect,
    authorize("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({
                    message: "New password is required.",
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message:
                        "Password must be at least 6 characters.",
                });
            }

            const owner = await User.findOne({
                _id: id,
                role: "shop_owner",
            });

            if (!owner) {
                return res.status(404).json({
                    message: "Shop owner not found.",
                });
            }

            owner.password = await bcrypt.hash(password, 10);

            await owner.save();

            res.json({
                message:
                    "Shop owner password changed successfully.",
            });
        } catch (error) {
            console.error(
                "Reset shop owner password error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while changing password.",
            });
        }
    }
);

// =====================================================
// REMOVE SHOP OWNER
// =====================================================
router.delete(
    "/shop-owner/:id",
    protect,
    authorize("admin"),
    async (req, res) => {
        try {
            const { id } = req.params;

            const owner = await User.findOne({
                _id: id,
                role: "shop_owner",
            });

            if (!owner) {
                return res.status(404).json({
                    message: "Shop owner not found.",
                });
            }

            // Remove owner from assigned shop
            if (owner.shopId) {
                await Shop.findByIdAndUpdate(
                    owner.shopId,
                    { $unset: { ownerId: "" } }
                );
            }

            // Delete owner account
            await User.findByIdAndDelete(owner._id);

            res.json({
                message:
                    "Shop owner removed successfully.",
            });
        } catch (error) {
            console.error("Remove shop owner error:", error);

            res.status(500).json({
                message:
                    "Server error while removing shop owner.",
            });
        }
    }
);

module.exports = router;