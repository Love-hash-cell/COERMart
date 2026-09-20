const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");
const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

// =====================================================
// CUSTOMER — CREATE ORDER
// Supports products from multiple shops
// Creates ONE separate order per shop
// =====================================================
router.post(
    "/",
    protect,
    authorize("customer"),
    async (req, res) => {
        try {
            const {
                items,
                customerName,
                phone,
                email,
                deliveryLocation,
                room,
                instructions,
                paymentMethod,
            } = req.body;

            // =================================================
            // VALIDATE CART
            // =================================================

            if (
                !items ||
                !Array.isArray(items) ||
                items.length === 0
            ) {
                return res.status(400).json({
                    message: "Cart is empty.",
                });
            }

            // =================================================
            // GET PRODUCT IDS
            // =================================================

            const productIds = items.map(
                (item) => item.productId
            );

            // =================================================
            // GET AVAILABLE PRODUCTS
            // =================================================

            const products = await Product.find({
                _id: {
                    $in: productIds,
                },
                available: true,
            });

            // Make sure every cart product exists
            if (
                products.length !==
                productIds.length
            ) {
                return res.status(400).json({
                    message:
                        "One or more products are unavailable.",
                });
            }

            // =================================================
            // GROUP ITEMS BY SHOP
            // =================================================

            const itemsByShop = {};

            for (const item of items) {
                const product =
                    products.find(
                        (p) =>
                            p._id.toString() ===
                            item.productId.toString()
                    );

                if (!product) {
                    return res.status(400).json({
                        message:
                            "One or more products could not be found.",
                    });
                }

                const shopId =
                    product.shopId.toString();

                if (!itemsByShop[shopId]) {
                    itemsByShop[shopId] = [];
                }

                itemsByShop[shopId].push({
                    item,
                    product,
                });
            }

            // =================================================
            // CREATE ONE ORDER PER SHOP
            // =================================================

            const createdOrders = [];

            for (
                const shopId of Object.keys(
                    itemsByShop
                )
            ) {
                const shopItems =
                    itemsByShop[shopId];

                // ---------------------------------------------
                // CREATE ORDER ITEMS
                // ---------------------------------------------

                const orderItems =
                    shopItems.map(
                        ({
                            item,
                            product,
                        }) => ({
                            productId:
                                product._id,

                            name:
                                product.name,

                            price:
                                product.price,

                            quantity:
                                Number(
                                    item.quantity
                                ) || 1,

                            image:
                                product.image ||
                                "",
                        })
                    );

                // ---------------------------------------------
                // CALCULATE THIS SHOP'S TOTAL
                // ---------------------------------------------

                const total =
                    orderItems.reduce(
                        (
                            sum,
                            item
                        ) =>
                            sum +
                            item.price *
                            item.quantity,
                        0
                    );

                // ---------------------------------------------
                // GENERATE UNIQUE ORDER ID
                // ---------------------------------------------

                let generatedOrderId;
                let orderExists = true;

                while (orderExists) {
                    generatedOrderId =
                        "COER" +
                        Math.floor(
                            100000 +
                            Math.random() *
                            900000
                        );

                    const existingOrder =
                        await Order.findOne({
                            orderId:
                                generatedOrderId,
                        });

                    orderExists =
                        !!existingOrder;
                }

                // ---------------------------------------------
                // CREATE ORDER
                // ---------------------------------------------

                const order =
                    await Order.create({
                        orderId:
                            generatedOrderId,

                        userId:
                            req.user._id,

                        shopId:
                            shopId,

                        items:
                            orderItems,

                        total:
                            total,

                        customerName:
                            customerName,

                        phone:
                            phone,

                        email:
                            email ||
                            req.user.email ||
                            "",

                        deliveryLocation:
                            deliveryLocation,

                        room:
                            room || "",

                        instructions:
                            instructions ||
                            "",

                        paymentMethod:
                            paymentMethod ||
                            "Cash on Delivery",

                        status:
                            "Order Placed",

                        paymentStatus:
                            "Pending",

                        eta:
                            "20–30 minutes",
                    });

                createdOrders.push(
                    order
                );
                // =================================================
                // REAL-TIME NEW ORDER NOTIFICATION
                // Notify the relevant shop owner
                // =================================================

                const io = req.app.get("io");

                if (io) {
                    io.to(`shop:${shopId}`).emit(
                        "new-order-created",
                        {
                            orderId: order.orderId,
                            shopId: order.shopId,
                            customerName: order.customerName,
                            total: order.total,
                            status: order.status,
                            createdAt: order.createdAt,
                        }
                    );
                }
            }

            // =================================================
            // SAFETY CHECK
            // =================================================

            if (
                createdOrders.length === 0
            ) {
                return res.status(400).json({
                    message:
                        "No valid orders could be created.",
                });
            }

            // =================================================
            // RESPONSE
            // =================================================

            /*
             * `orders` = all shop-specific orders
             *
             * `order` = first order
             * kept for backward compatibility
             * with older frontend code.
             */

            res.status(201).json({
                message:
                    "Order placed successfully.",

                orders:
                    createdOrders,

                order:
                    createdOrders[0],

                orderCount:
                    createdOrders.length,
            });
        } catch (error) {
            console.error(
                "Create order error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to create order.",

                error:
                    error.message,
            });
        }
    }
);

// =====================================================
// CUSTOMER — MY ORDERS
// =====================================================
router.get(
    "/my-orders",
    protect,
    authorize("customer"),
    async (req, res) => {
        try {
            const orders =
                await Order.find({
                    userId:
                        req.user._id,
                })
                    .populate(
                        "shopId",
                        "name type"
                    )
                    .sort({
                        createdAt: -1,
                    });

            // =================================================
            // FORMAT SHOP INFORMATION FOR FRONTEND
            // Frontend expects: order.shop.name
            // MongoDB stores: order.shopId
            // =================================================

            const formattedOrders =
                orders.map(
                    (order) => {
                        const orderObject =
                            order.toObject();

                        return {
                            ...orderObject,

                            shop:
                                orderObject.shopId
                                    ? {
                                        _id:
                                            orderObject
                                                .shopId
                                                ._id,

                                        name:
                                            orderObject
                                                .shopId
                                                .name,

                                        type:
                                            orderObject
                                                .shopId
                                                .type,
                                    }
                                    : undefined,
                        };
                    }
                );

            res.json(
                formattedOrders
            );
        } catch (error) {
            console.error(
                "My orders error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch orders.",

                error:
                    error.message,
            });
        }
    }
);

// =====================================================
// SHOP OWNER — MY SHOP ORDERS
// IMPORTANT: Must come BEFORE /:orderId
// =====================================================
router.get(
    "/shop/my-orders",
    protect,
    authorize("shop_owner"),
    async (req, res) => {
        try {
            const orders =
                await Order.find({
                    shopId:
                        req.user.shopId,
                }).sort({
                    createdAt: -1,
                });

            res.json(orders);
        } catch (error) {
            console.error(
                "Shop orders error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch shop orders.",

                error:
                    error.message,
            });
        }
    }
);

// =====================================================
// ADMIN — ALL ORDERS
// IMPORTANT: Must come BEFORE /:orderId
// =====================================================
router.get(
    "/admin/all",
    protect,
    authorize("admin"),
    async (req, res) => {
        try {
            const orders =
                await Order.find()
                    .populate(
                        "userId",
                        "name email phone"
                    )
                    .populate(
                        "shopId",
                        "name type"
                    )
                    .sort({
                        createdAt: -1,
                    });

            res.json(orders);
        } catch (error) {
            console.error(
                "Admin orders error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch all orders.",

                error:
                    error.message,
            });
        }
    }
);

// =====================================================
// CUSTOMER / SHOP OWNER / ADMIN — SINGLE ORDER
// =====================================================
router.get(
    "/:orderId",
    protect,
    async (req, res) => {
        try {
            const order =
                await Order.findOne({
                    orderId:
                        req.params.orderId,
                });

            if (!order) {
                return res.status(404).json({
                    message:
                        "Order not found.",
                });
            }

            // =================================================
            // CUSTOMER AUTHORIZATION
            // =================================================

            if (
                req.user.role ===
                "customer" &&
                order.userId.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "Not authorized to view this order.",
                });
            }

            // =================================================
            // SHOP OWNER AUTHORIZATION
            // =================================================

            if (
                req.user.role ===
                "shop_owner" &&
                order.shopId.toString() !==
                req.user.shopId.toString()
            ) {
                return res.status(403).json({
                    message:
                        "Not authorized to view this order.",
                });
            }

            // Admin can view any order

            res.json(order);
        } catch (error) {
            console.error(
                "Single order error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch order.",

                error:
                    error.message,
            });
        }
    }
);

// =====================================================
// SHOP OWNER — UPDATE ORDER STATUS
// =====================================================
router.put(
    "/:orderId/status",
    protect,
    authorize("shop_owner"),
    async (req, res) => {
        try {
            const {
                status,
            } = req.body;

            // =================================================
            // ALLOWED STATUSES
            // =================================================

            const allowedStatuses = [
                "Order Placed",
                "Accepted",
                "Preparing",
                "Out for Delivery",
                "Delivered",
                "Cancelled",
            ];

            if (
                !allowedStatuses.includes(
                    status
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid order status.",
                });
            }

            // =================================================
            // FIND ORDER FOR THIS SHOP OWNER
            // =================================================

            const order =
                await Order.findOne({
                    orderId:
                        req.params.orderId,

                    shopId:
                        req.user.shopId,
                });

            if (!order) {
                return res.status(404).json({
                    message:
                        "Order not found.",
                });
            }

            // =================================================
            // UPDATE STATUS
            // =================================================

            order.status =
                status;

            // =================================================
            // COD PAYMENT
            // Mark as paid after delivery
            // =================================================

            if (
                status ===
                "Delivered"
            ) {
                if (
                    order.paymentMethod ===
                    "Cash on Delivery"
                ) {
                    order.paymentStatus =
                        "Paid";
                }
            }

            await order.save();

            // =================================================
            // REAL-TIME SOCKET.IO UPDATE
            // =================================================

            const io =
                req.app.get("io");

            if (io) {
                io.to(
                    `order:${order.orderId}`
                ).emit(
                    "order-status-updated",
                    {
                        orderId:
                            order.orderId,

                        status:
                            order.status,

                        eta:
                            order.eta,
                    }
                );
            }

            // =================================================
            // RESPONSE
            // =================================================

            res.json({
                message:
                    "Order status updated successfully.",

                order,
            });
        } catch (error) {
            console.error(
                "Update order status error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to update order status.",

                error:
                    error.message,
            });
        }
    }
);

module.exports = router;