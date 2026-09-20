import {
    CheckCircle,
    Clock,
    MapPin,
    Package,
    ShoppingBag,
    Truck,
    User,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../utils/config";

interface OrderItem {
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface OrderData {
    orderId: string;
    studentName: string;
    phone: string;
    deliveryLocation: string;
    room: string;
    instructions: string;
    email: string;
    total: number;
    status:
    | "Order Placed"
    | "Accepted"
    | "Preparing"
    | "Out for Delivery"
    | "Delivered"
    | "Cancelled";
    eta: string;
    paymentMethod: string;
    paymentStatus: string;
    items: OrderItem[];
    shop?: {
        _id?: string;
        name?: string;
        type?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

const API_BASE = API_URL;

function OrderTracking() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    /* =========================
       GET CUSTOMER ORDERS
    ========================= */
    const fetchOrders = useCallback(
        async (showLoader = false) => {
            try {
                if (showLoader) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const token =
                    sessionStorage.getItem("coermart_token");

                if (!token) {
                    setError(
                        "Please login to view your orders."
                    );
                    setOrders([]);
                    return;
                }

                const response = await fetch(
                    `${API_BASE}/api/orders/my-orders`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        setError(
                            "Your session has expired. Please login again."
                        );
                    } else if (response.status === 403) {
                        setError(
                            "You do not have permission to access your orders."
                        );
                    } else {
                        setError(
                            data.message ||
                            "Unable to load orders."
                        );
                    }

                    setOrders([]);
                    return;
                }

                const backendOrders =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data.orders)
                            ? data.orders
                            : [];

                setOrders(
                    backendOrders.map((order: any) => ({
                        orderId: order.orderId,
                        studentName:
                            order.customerName || "",
                        phone: order.phone || "",
                        deliveryLocation:
                            order.deliveryLocation || "",
                        room: order.room || "",
                        instructions:
                            order.instructions || "",
                        email: order.email || "",
                        total: Number(order.total) || 0,
                        status:
                            order.status ||
                            "Order Placed",
                        eta:
                            order.eta ||
                            "20–30 minutes",
                        paymentMethod:
                            order.paymentMethod ||
                            "Cash on Delivery",
                        paymentStatus:
                            order.paymentStatus ||
                            "Pending",
                        items: Array.isArray(
                            order.items
                        )
                            ? order.items
                            : [],
                        shop:
                            order.shop ||
                            undefined,
                        createdAt:
                            order.createdAt,
                        updatedAt:
                            order.updatedAt,
                    }))
                );
            } catch (error) {
                console.error(
                    "Fetch orders error:",
                    error
                );

                setError(
                    "Unable to connect to the server."
                );

                setOrders([]);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    /* =========================
       INITIAL LOAD
    ========================= */
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    /* =========================
       REAL-TIME SOCKET.IO
    ========================= */
    useEffect(() => {
        const socket = io(API_BASE);

        socket.on("connect", () => {
            console.log(
                "Real-time order tracking connected:",
                socket.id
            );
        });

        // Join a separate room for every customer's order
        orders.forEach((order) => {
            socket.emit(
                "join-order",
                order.orderId
            );
        });

        // Receive immediate status updates
        socket.on(
            "order-status-updated",
            (updatedOrder: {
                orderId: string;
                status: OrderData["status"];
                eta: string;
            }) => {
                console.log(
                    "Real-time order update:",
                    updatedOrder
                );

                setOrders((currentOrders) =>
                    currentOrders.map((order) =>
                        order.orderId ===
                            updatedOrder.orderId
                            ? {
                                ...order,
                                status:
                                    updatedOrder.status,
                                eta:
                                    updatedOrder.eta,
                            }
                            : order
                    )
                );
            }
        );

        return () => {
            socket.disconnect();
        };
    }, [orders]);

    /* =========================
       AUTO REFRESH
       Kept as fallback
    ========================= */
    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrders(true);
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchOrders]);

    /* =========================
       REFRESH WHEN TAB GETS FOCUS
    ========================= */
    useEffect(() => {
        const handleFocus = () => {
            fetchOrders(true);
        };

        window.addEventListener(
            "focus",
            handleFocus
        );

        return () => {
            window.removeEventListener(
                "focus",
                handleFocus
            );
        };
    }, [fetchOrders]);

    /* =========================
       ORDER PLACED EVENT
    ========================= */
    useEffect(() => {
        const handleOrderPlaced = () => {
            fetchOrders(true);
        };

        window.addEventListener(
            "order-placed",
            handleOrderPlaced
        );

        return () => {
            window.removeEventListener(
                "order-placed",
                handleOrderPlaced
            );
        };
    }, [fetchOrders]);

    /* =========================
       ORDER STATUS UPDATED
    ========================= */
    useEffect(() => {
        const handleStatusUpdated = () => {
            fetchOrders(true);
        };

        window.addEventListener(
            "order-status-updated",
            handleStatusUpdated
        );

        return () => {
            window.removeEventListener(
                "order-status-updated",
                handleStatusUpdated
            );
        };
    }, [fetchOrders]);

    /* =========================
       LOADING
    ========================= */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 px-6 py-8 text-gray-900 dark:bg-gray-950 dark:text-white">
                <div className="mx-auto max-w-6xl">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-500">
                        COERMart
                    </p>

                    <h1 className="text-3xl font-black">
                        Track Your Orders
                    </h1>

                    <div className="mt-8 flex min-h-[250px] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-500 dark:border-gray-700" />

                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                Loading your orders...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================
       ERROR
    ========================= */
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 px-6 py-8 text-gray-900 dark:bg-gray-950 dark:text-white">
                <div className="mx-auto max-w-6xl">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-500">
                        COERMart
                    </p>

                    <h1 className="text-3xl font-black">
                        Track Your Orders
                    </h1>

                    <div className="mt-8 rounded-2xl border border-red-500/70 bg-white p-10 text-center dark:bg-gray-900">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                            <Package
                                size={24}
                                className="text-red-500"
                            />
                        </div>

                        <h2 className="text-base font-bold">
                            Unable to load orders
                        </h2>

                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                fetchOrders(true)
                            }
                            className="mt-5 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* =========================
       NO ORDERS
    ========================= */
    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 px-6 py-8 text-gray-900 dark:bg-gray-950 dark:text-white">
                <div className="mx-auto max-w-6xl">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-500">
                        COERMart
                    </p>

                    <h1 className="text-3xl font-black">
                        Track Your Orders
                    </h1>

                    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <ShoppingBag
                                size={26}
                                className="text-gray-400"
                            />
                        </div>

                        <h2 className="text-lg font-bold">
                            No orders yet
                        </h2>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Your placed orders will
                            appear here.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-8 text-gray-900 dark:bg-gray-950 dark:text-white">
            <div className="mx-auto max-w-6xl">

                {/* HEADER */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-500">
                            COERMart
                        </p>

                        <h1 className="text-3xl font-black">
                            Track Your Orders
                        </h1>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {orders.length}{" "}
                            {orders.length === 1
                                ? "order"
                                : "orders"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchOrders(true)
                        }
                        disabled={refreshing}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>
                </div>

                {/* ORDERS */}
                <div className="mt-8 space-y-6">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.orderId}
                            order={order}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* =========================
   ORDER CARD
========================= */
function OrderCard({
    order,
}: {
    order: OrderData;
}) {
    const isCancelled =
        order.status === "Cancelled";

    const statusSteps = [
        "Order Placed",
        "Accepted",
        "Preparing",
        "Out for Delivery",
        "Delivered",
    ];

    const currentIndex =
        statusSteps.indexOf(order.status);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

            {/* ORDER HEADER */}
            <div className="border-b border-gray-200 p-5 dark:border-gray-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                            Order ID
                        </p>

                        <p className="mt-1 text-lg font-black text-gray-900 dark:text-white">
                            #{order.orderId}
                        </p>

                        {order.shop?.name && (
                            <p className="mt-1 text-sm font-semibold text-red-500 dark:text-red-400">
                                {order.shop.name}
                            </p>
                        )}
                    </div>

                    <StatusBadge
                        status={order.status}
                    />
                </div>
            </div>

            {/* CUSTOMER / DELIVERY */}
            <div className="grid gap-4 border-b border-gray-200 p-5 dark:border-gray-800 md:grid-cols-2">

                <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <User
                            size={17}
                            className="text-gray-500 dark:text-gray-400"
                        />
                    </div>

                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Customer
                        </p>

                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {order.studentName}
                        </p>

                        {order.phone && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {order.phone}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <MapPin
                            size={17}
                            className="text-gray-500 dark:text-gray-400"
                        />
                    </div>

                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Delivery Location
                        </p>

                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {order.deliveryLocation}
                        </p>

                        {order.room && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {order.room}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* STATUS TRACKER */}
            {!isCancelled ? (
                <div className="border-b border-gray-200 p-5 dark:border-gray-800">

                    <div className="flex items-start justify-between">
                        {statusSteps.map(
                            (
                                step,
                                index
                            ) => {
                                const completed =
                                    currentIndex >=
                                    index;

                                const active =
                                    currentIndex ===
                                    index;

                                return (
                                    <div
                                        key={step}
                                        className="flex flex-1 items-start"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-full ${completed
                                                    ? "bg-red-500 text-white"
                                                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                                                    }`}
                                            >
                                                {index ===
                                                    0 ? (
                                                    <ShoppingBag
                                                        size={
                                                            16
                                                        }
                                                    />
                                                ) : index ===
                                                    1 ? (
                                                    <CheckCircle
                                                        size={
                                                            16
                                                        }
                                                    />
                                                ) : index ===
                                                    2 ? (
                                                    <Package
                                                        size={
                                                            16
                                                        }
                                                    />
                                                ) : index ===
                                                    3 ? (
                                                    <Truck
                                                        size={
                                                            16
                                                        }
                                                    />
                                                ) : (
                                                    <CheckCircle
                                                        size={
                                                            16
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <p
                                                className={`mt-2 text-center text-[9px] font-bold ${active
                                                    ? "text-red-500 dark:text-red-400"
                                                    : completed
                                                        ? "text-gray-600 dark:text-gray-300"
                                                        : "text-gray-400 dark:text-gray-600"
                                                    }`}
                                            >
                                                {step}
                                            </p>
                                        </div>

                                        {index <
                                            statusSteps.length -
                                            1 && (
                                                <div
                                                    className={`mt-4 h-0.5 flex-1 ${currentIndex >
                                                        index
                                                        ? "bg-red-500"
                                                        : "bg-gray-200 dark:bg-gray-800"
                                                        }`}
                                                />
                                            )}
                                    </div>
                                );
                            }
                        )}
                    </div>

                    {order.status !==
                        "Delivered" && (
                            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Clock size={16} />

                                <span>
                                    Estimated delivery:
                                </span>

                                <span className="font-bold text-gray-900 dark:text-white">
                                    {order.eta}
                                </span>
                            </div>
                        )}
                </div>
            ) : (
                <div className="border-b border-gray-200 p-5 dark:border-gray-800">
                    <div className="flex items-center justify-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-500 dark:text-red-400">
                        <XCircle size={20} />

                        <span className="text-sm font-bold">
                            This order has been
                            cancelled.
                        </span>
                    </div>
                </div>
            )}

            {/* ITEMS */}
            <div className="p-5">

                <div className="mb-4 flex items-center gap-2">
                    <ShoppingBag
                        size={17}
                        className="text-red-500"
                    />

                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                        Order Items
                    </h3>
                </div>

                <div className="space-y-3">
                    {order.items.map(
                        (item, index) => (
                            <div
                                key={`${order.orderId}-${index}`}
                                className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50"
                            >
                                <div className="flex min-w-0 items-center gap-3">

                                    {item.image ? (
                                        <img
                                            src={
                                                item.image
                                            }
                                            alt={
                                                item.name
                                            }
                                            className="h-12 w-12 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                            <Package
                                                size={
                                                    18
                                                }
                                                className="text-gray-400 dark:text-gray-500"
                                            />
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                            {item.name}
                                        </p>

                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            ₹
                                            {item.price}{" "}
                                            ×{" "}
                                            {item.quantity}
                                        </p>
                                    </div>
                                </div>

                                <p className="shrink-0 text-sm font-black text-gray-900 dark:text-white">
                                    ₹
                                    {(
                                        item.price *
                                        item.quantity
                                    ).toFixed(2)}
                                </p>
                            </div>
                        )
                    )}
                </div>

                {/* TOTAL */}
                <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-5 dark:border-gray-800">

                    <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Payment
                        </p>

                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {order.paymentMethod}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Total
                        </p>

                        <p className="text-xl font-black text-red-500 dark:text-red-400">
                            ₹
                            {order.total.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* =========================
   STATUS BADGE
========================= */
function StatusBadge({
    status,
}: {
    status: OrderData["status"];
}) {
    if (status === "Cancelled") {
        return (
            <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500 dark:text-red-400">
                <XCircle size={14} />
                Cancelled
            </div>
        );
    }

    if (status === "Delivered") {
        return (
            <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-500 dark:text-green-400">
                <CheckCircle size={14} />
                Delivered
            </div>
        );
    }

    if (status === "Out for Delivery") {
        return (
            <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-500 dark:text-blue-400">
                <Truck size={14} />
                Out for Delivery
            </div>
        );
    }

    if (status === "Preparing") {
        return (
            <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-500 dark:text-orange-400">
                <Package size={14} />
                Preparing
            </div>
        );
    }

    if (status === "Accepted") {
        return (
            <div className="flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-500 dark:text-purple-400">
                <CheckCircle size={14} />
                Accepted
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-bold text-yellow-500 dark:text-yellow-400">
            <Clock size={14} />
            Order Placed
        </div>
    );
}

export default OrderTracking;