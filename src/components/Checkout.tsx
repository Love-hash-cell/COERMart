import {
    ArrowLeft,
    CheckCircle,
    Clock,
    MapPin,
    ShoppingBag,
    User,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useOrders, type Order } from "../context/OrdersContext";
import { API_URL } from "../utils/config";

interface CheckoutProps {
    onBack: () => void;
    onOrderPlaced: () => void;
}

interface BackendOrder {
    orderId: string;
    total: number;
    status: Order["status"];
    eta?: string;
    createdAt: string;
}

function Checkout({
    onBack,
    onOrderPlaced,
}: CheckoutProps) {
    const {
        cartItems,
        cartTotal,
        clearCart,
    } = useCart();

    const { addOrder } = useOrders();

    const [studentName, setStudentName] =
        useState("");

    const [deliveryType, setDeliveryType] =
        useState("Hostel");

    const [location, setLocation] =
        useState("");

    const [roomNumber, setRoomNumber] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [instructions, setInstructions] =
        useState("");

    const [placingOrder, setPlacingOrder] =
        useState(false);

    const [orderPlaced, setOrderPlaced] =
        useState(false);

    const [orderIds, setOrderIds] =
        useState<string[]>([]);

    const deliveryOptions = [
        "Hostel",
        "Classroom",
        "Library",
        "Lab",
        "College Gate",
        "Other",
    ];

    // ============================================================
    // PLACE ORDER
    // ============================================================

    const handlePlaceOrder = async () => {
        if (!studentName.trim()) {
            alert("Please enter your name.");
            return;
        }

        if (!location.trim()) {
            alert(
                "Please enter your delivery location."
            );
            return;
        }

        if (!phone.trim()) {
            alert(
                "Please enter your phone number."
            );
            return;
        }

        if (
            (
                deliveryType === "Hostel" ||
                deliveryType === "Classroom" ||
                deliveryType === "Lab"
            ) &&
            !roomNumber.trim()
        ) {
            alert(
                "Please enter your room/class/lab number."
            );
            return;
        }

        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const token =
            sessionStorage.getItem(
                "coermart_token"
            );

        if (!token) {
            alert(
                "Please login before placing an order."
            );
            return;
        }

        setPlacingOrder(true);

        try {
            // ====================================================
            // GET LOGGED-IN USER EMAIL
            // ====================================================

            let email = "";

            try {
                const savedUser =
                    sessionStorage.getItem(
                        "coermart_user"
                    );

                if (savedUser) {
                    const parsedUser =
                        JSON.parse(savedUser);

                    email =
                        parsedUser.email || "";
                }
            } catch {
                email = "";
            }

            // ====================================================
            // SEND COMPLETE CART TO BACKEND
            // Backend automatically splits it by shop
            // ====================================================

            const response = await fetch(
                `${API_URL}/api/orders`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        items: cartItems.map(
                            (item) => ({
                                productId:
                                    (item as any)
                                        .productId ||
                                    (item as any)
                                        ._id,

                                quantity:
                                    item.quantity,
                            })
                        ),

                        customerName:
                            studentName.trim(),

                        phone:
                            phone.trim(),

                        email,

                        deliveryLocation:
                            location.trim(),

                        room:
                            roomNumber.trim(),

                        instructions:
                            instructions.trim(),

                        paymentMethod:
                            "Cash on Delivery",
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to place order."
                );
            }

            // ====================================================
            // GET ALL CREATED ORDERS
            // ====================================================

            const backendOrders: BackendOrder[] =
                Array.isArray(data.orders)
                    ? data.orders
                    : data.order
                        ? [data.order]
                        : [];

            if (
                backendOrders.length === 0
            ) {
                throw new Error(
                    "Order was not created."
                );
            }

            const createdOrderIds =
                backendOrders.map(
                    (order) =>
                        order.orderId
                );

            setOrderIds(
                createdOrderIds
            );

            // ====================================================
            // ADD EACH ORDER TO LOCAL ORDERS CONTEXT
            // ====================================================

            backendOrders.forEach(
                (backendOrder) => {
                    const newOrder: Order = {
                        orderId:
                            backendOrder.orderId,

                        studentName:
                            studentName.trim(),

                        phone:
                            phone.trim(),

                        deliveryType,

                        location:
                            location.trim(),

                        roomNumber:
                            roomNumber.trim(),

                        instructions:
                            instructions.trim(),

                        items: cartItems.map(
                            (item) => ({
                                name:
                                    item.name,

                                store:
                                    item.store,

                                price:
                                    item.price,

                                quantity:
                                    item.quantity,

                                image:
                                    item.image,
                            })
                        ),

                        total:
                            backendOrder.total,

                        status:
                            backendOrder.status ||
                            "Order Placed",

                        estimatedDelivery:
                            backendOrder.eta ||
                            "20–30 minutes",

                        createdAt:
                            backendOrder.createdAt ||
                            new Date().toISOString(),
                    };

                    addOrder(newOrder);
                }
            );

            // ====================================================
            // SAVE FIRST ORDER FOR TRACKING
            // ====================================================

            const firstOrder =
                backendOrders[0];

            const localOrder = {
                orderId:
                    firstOrder.orderId,

                orderIds:
                    createdOrderIds,

                studentName:
                    studentName.trim(),

                phone:
                    phone.trim(),

                deliveryType,

                location:
                    location.trim(),

                roomNumber:
                    roomNumber.trim(),

                instructions:
                    instructions.trim(),

                total: cartTotal,

                items: cartItems,

                estimatedDelivery:
                    firstOrder.eta ||
                    "20–30 minutes",

                status:
                    firstOrder.status ||
                    "Order Placed",

                createdAt:
                    firstOrder.createdAt ||
                    new Date().toISOString(),
            };

            localStorage.setItem(
                "coermart_last_order",
                JSON.stringify(
                    localOrder
                )
            );

            localStorage.setItem(
                "coermart_latest_order",
                JSON.stringify(
                    localOrder
                )
            );

            // ====================================================
            // UPDATE UI
            // ====================================================

            setPlacingOrder(false);

            setOrderPlaced(true);

            clearCart();

            window.dispatchEvent(
                new Event("order-placed")
            );
        } catch (error) {
            console.error(
                "Place order error:",
                error
            );

            setPlacingOrder(false);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to place order. Please try again."
            );
        }
    };

    // ============================================================
    // TRACK ORDER
    // ============================================================

    const handleTrackOrder = () => {
        const savedOrder =
            localStorage.getItem(
                "coermart_last_order"
            );

        if (!savedOrder) {
            alert(
                "No order found. Please place an order first."
            );
            return;
        }

        window.dispatchEvent(
            new Event(
                "open-order-tracking"
            )
        );
    };

    // ============================================================
    // SUCCESS SCREEN
    // ============================================================

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
                <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
                    <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-500/10">
                            <CheckCircle size={44} />
                        </div>

                        <h1 className="mt-6 text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
                            Order Placed Successfully!
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Thank you for ordering from
                            COERMart. Your campus delivery
                            partner will deliver your order
                            to the selected location.
                        </p>

                        {/* ORDER IDS */}

                        <div className="mt-6 rounded-2xl bg-red-50 p-4 dark:bg-red-500/10">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {orderIds.length > 1
                                    ? "Order IDs"
                                    : "Order ID"}
                            </p>

                            <div className="mt-2 space-y-1">
                                {orderIds.map(
                                    (id) => (
                                        <p
                                            key={id}
                                            className="text-lg font-black text-red-500"
                                        >
                                            #{id}
                                        </p>
                                    )
                                )}
                            </div>

                            {orderIds.length > 1 && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Your items were automatically
                                    separated into orders for
                                    each shop.
                                </p>
                            )}
                        </div>

                        {/* STUDENT DETAILS */}

                        <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-left dark:bg-gray-950">
                            <div className="flex items-start gap-3">
                                <User
                                    size={20}
                                    className="mt-0.5 shrink-0 text-red-500"
                                />

                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Order for
                                    </p>

                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {studentName}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {phone}
                                    </p>
                                </div>
                            </div>

                            <div className="my-4 border-t border-gray-200 dark:border-gray-800" />

                            <div className="flex items-start gap-3">
                                <MapPin
                                    size={20}
                                    className="mt-0.5 shrink-0 text-red-500"
                                />

                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Delivering to
                                    </p>

                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {deliveryType}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {location}

                                        {roomNumber
                                            ? ` • ${roomNumber}`
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* DELIVERY TIME */}

                        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-left dark:bg-gray-950">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
                                <Clock size={19} />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Estimated delivery
                                </p>

                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    20–30 minutes
                                </p>
                            </div>
                        </div>

                        {/* TRACK ORDER */}

                        <button
                            type="button"
                            onClick={
                                handleTrackOrder
                            }
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:bg-red-600 hover:shadow-lg"
                        >
                            <MapPin size={18} />
                            Track Your Order
                        </button>

                        {/* CONTINUE SHOPPING */}

                        <button
                            type="button"
                            onClick={
                                onOrderPlaced
                            }
                            className="mt-3 w-full rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================
    // CHECKOUT SCREEN
    // ============================================================

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* BACK */}

                <button
                    type="button"
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white hover:text-red-500 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                    <ArrowLeft size={18} />
                    Back to Cart
                </button>

                {/* HEADER */}

                <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-wide text-red-500">
                        COERMart Checkout
                    </p>

                    <h1 className="mt-1 text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
                        Complete Your Order
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Tell us where and to whom we
                        should deliver your order.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

                    {/* LEFT */}

                    <div className="space-y-6">

                        {/* STUDENT INFORMATION */}

                        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10">
                                    <User size={21} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white">
                                        Student Information
                                    </h2>

                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Who should receive
                                        this order?
                                    </p>
                                </div>
                            </div>

                            {/* NAME */}

                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-200">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        studentName
                                    }
                                    onChange={(e) =>
                                        setStudentName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Love Tyagi"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:focus:bg-gray-900"
                                />
                            </div>

                            {/* PHONE */}

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-200">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your phone number"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:focus:bg-gray-900"
                                />
                            </div>
                        </div>

                        {/* DELIVERY */}

                        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10">
                                    <MapPin size={21} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white">
                                        Delivery Location
                                    </h2>

                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Choose anywhere
                                        inside campus
                                    </p>
                                </div>
                            </div>

                            {/* DELIVERY TYPE */}

                            <div className="mt-7">
                                <label className="mb-3 block text-sm font-bold text-gray-800 dark:text-gray-200">
                                    Deliver to
                                </label>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {deliveryOptions.map(
                                        (option) => (
                                            <button
                                                type="button"
                                                key={
                                                    option
                                                }
                                                onClick={() =>
                                                    setDeliveryType(
                                                        option
                                                    )
                                                }
                                                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${deliveryType ===
                                                    option
                                                    ? "border-red-500 bg-red-50 text-red-500 dark:border-red-500 dark:bg-red-500/10 dark:text-red-400"
                                                    : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-red-500/30"
                                                    }`}
                                            >
                                                {
                                                    option
                                                }
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* LOCATION */}

                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-200">
                                    {deliveryType ===
                                        "Hostel"
                                        ? "Hostel Name"
                                        : deliveryType ===
                                            "Classroom"
                                            ? "Block / Building"
                                            : deliveryType ===
                                                "Lab"
                                                ? "Lab / Building"
                                                : "Location"}
                                </label>

                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(
                                            e.target.value
                                        )
                                    }
                                    placeholder={
                                        deliveryType ===
                                            "Hostel"
                                            ? "e.g. Boys Hostel A"
                                            : deliveryType ===
                                                "Classroom"
                                                ? "e.g. CSE Block"
                                                : deliveryType ===
                                                    "Lab"
                                                    ? "e.g. Computer Lab"
                                                    : "Enter delivery location"
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:focus:bg-gray-900"
                                />
                            </div>

                            {/* ROOM */}

                            {(
                                deliveryType ===
                                "Hostel" ||
                                deliveryType ===
                                "Classroom" ||
                                deliveryType ===
                                "Lab"
                            ) && (
                                    <div className="mt-5">
                                        <label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-200">
                                            {deliveryType ===
                                                "Hostel"
                                                ? "Room Number"
                                                : deliveryType ===
                                                    "Classroom"
                                                    ? "Room / Class Number"
                                                    : "Lab Number"}
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                roomNumber
                                            }
                                            onChange={(e) =>
                                                setRoomNumber(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder={
                                                deliveryType ===
                                                    "Hostel"
                                                    ? "e.g. Room 204"
                                                    : deliveryType ===
                                                        "Classroom"
                                                        ? "e.g. 305"
                                                        : "e.g. Lab 2"
                                            }
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:focus:bg-gray-900"
                                        />
                                    </div>
                                )}

                            {/* INSTRUCTIONS */}

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-200">
                                    Delivery Instructions

                                    <span className="ml-1 font-normal text-gray-400">
                                        (Optional)
                                    </span>
                                </label>

                                <textarea
                                    value={
                                        instructions
                                    }
                                    onChange={(e) =>
                                        setInstructions(
                                            e.target
                                                .value
                                        )
                                    }
                                    rows={3}
                                    placeholder="e.g. Call me when you reach the location"
                                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:focus:bg-gray-900"
                                />
                            </div>

                            {/* NOTE */}

                            <div className="mt-5 rounded-xl bg-red-50 p-4 dark:bg-red-500/10">
                                <p className="text-xs leading-5 text-red-700 dark:text-red-300">
                                    📍 You can receive your
                                    order anywhere inside
                                    the campus — hostel,
                                    classroom, library,
                                    lab, college gate, or
                                    another campus location.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT - ORDER SUMMARY */}

                    <div className="h-fit rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                        <div className="flex items-center gap-3">
                            <ShoppingBag
                                size={20}
                                className="text-red-500"
                            />

                            <h2 className="text-lg font-black text-gray-900 dark:text-white">
                                Order Summary
                            </h2>
                        </div>

                        <div className="mt-5 space-y-4">
                            {cartItems.map(
                                (item, index) => (
                                    <div
                                        key={`${item.name}-${index}`}
                                        className="flex items-center gap-3"
                                    >
                                        <img
                                            src={
                                                item.image
                                            }
                                            alt={
                                                item.name
                                            }
                                            className="h-14 w-14 rounded-xl object-cover"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                                {
                                                    item.name
                                                }
                                            </p>

                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Qty:{" "}
                                                {
                                                    item.quantity
                                                }
                                            </p>

                                            <p className="text-xs text-red-500">
                                                {
                                                    item.store
                                                }
                                            </p>
                                        </div>

                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            ₹
                                            {item.price *
                                                item.quantity}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="my-5 border-t border-gray-200 dark:border-gray-800" />

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Total
                            </span>

                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                ₹{cartTotal}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={
                                handlePlaceOrder
                            }
                            disabled={
                                placingOrder
                            }
                            className="mt-6 w-full rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:bg-red-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {placingOrder
                                ? "Placing Order..."
                                : "Place Order"}
                        </button>

                        <p className="mt-3 text-center text-xs text-gray-400">
                            Campus delivery • Fast &
                            convenient
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;