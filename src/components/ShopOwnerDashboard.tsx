import { useEffect, useState, type FormEvent } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../utils/config";
import {
    Plus,
    Trash2,
    Package,
    Store,
    ShoppingBag,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
} from "lucide-react";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    type: "food" | "stationery";
    shopId: string;
    available: boolean;
}

interface Shop {
    _id: string;
    name: string;
    type: "food" | "stationery";
}

type OrderStatus =
    | "Order Placed"
    | "Accepted"
    | "Preparing"
    | "Out for Delivery"
    | "Delivered"
    | "Cancelled";

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface Order {
    _id: string;
    orderId: string;
    customerName: string;
    phone: string;
    email: string;
    deliveryLocation: string;
    room: string;
    instructions: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    paymentMethod: string;
    paymentStatus: string;
    eta: string;
    createdAt: string;
}

function ShopOwnerDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [shop, setShop] = useState<Shop | null>(null);

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [updatingOrder, setUpdatingOrder] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState("");

    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = sessionStorage.getItem("coermart_token");

    /* ================================
       FETCH PRODUCTS
    ================================= */

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/products/my-products`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch products."
                );
            }

            setProducts(data);
        } catch (error) {
            console.error("Fetch products error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch products."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ================================
       FETCH SHOP
    ================================= */

    const fetchShop = async () => {
        try {
            const userData =
                sessionStorage.getItem("coermart_user");

            if (!userData) return;

            const user = JSON.parse(userData);

            if (!user.shopId) return;

            const response = await fetch(
                `${API_URL}/api/shops`
            );

            const shops = await response.json();

            if (!response.ok) return;

            const currentShop = shops.find(
                (item: Shop) => item._id === user.shopId
            );

            if (currentShop) {
                setShop(currentShop);
            }
        } catch (error) {
            console.error("Fetch shop error:", error);
        }
    };

    /* ================================
       FETCH SHOP ORDERS
    ================================= */

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);

            const response = await fetch(
                `${API_URL}/api/orders/shop/my-orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch orders."
                );
            }

            setOrders(data);
        } catch (error) {
            console.error("Fetch orders error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch orders."
            );
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchShop();
        fetchOrders();

        // =============================================
        // REAL-TIME NEW ORDER LISTENER
        // =============================================

        const savedUser =
            sessionStorage.getItem("coermart_user");

        if (!savedUser) return;

        let user;

        try {
            user = JSON.parse(savedUser);
        } catch (error) {
            console.error(
                "Failed to parse user data:",
                error
            );
            return;
        }

        const shopId = user.shopId;

        if (!shopId) return;

        const socket = io(API_URL);

        socket.on("connect", () => {
            console.log(
                "Shop owner socket connected:",
                socket.id
            );

            socket.emit("join-shop", shopId);
        });

        socket.on(
            "new-order-created",
            (newOrder) => {
                console.log(
                    "New order received:",
                    newOrder
                );

                // Fetch the complete order details
                // without changing the existing UI
                fetchOrders();
            }
        );

        socket.on("connect_error", (error) => {
            console.error(
                "Shop owner socket error:",
                error
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    /* ================================
       ADD PRODUCT
    ================================= */

    const handleAddProduct = async (e: FormEvent) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Please enter product name.");
            return;
        }

        if (!price.trim()) {
            setError("Please enter product price.");
            return;
        }

        if (!category.trim()) {
            setError("Please enter product category.");
            return;
        }

        if (!token) {
            setError("You are not logged in.");
            return;
        }

        try {
            setAdding(true);

            const response = await fetch(
                `${API_URL}/api/products`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        description: description.trim(),
                        price: Number(price),
                        category: category.trim(),
                        image: image.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add product."
                );
            }

            setSuccess("Product added successfully!");

            setName("");
            setDescription("");
            setPrice("");
            setCategory("");
            setImage("");

            fetchProducts();
        } catch (error) {
            console.error("Add product error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to add product."
            );
        } finally {
            setAdding(false);
        }
    };

    /* ================================
       DELETE PRODUCT
    ================================= */

    const handleDeleteProduct = async (productId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/api/products/${productId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete product."
                );
            }

            setSuccess("Product deleted successfully!");

            setProducts((current) =>
                current.filter(
                    (product) => product._id !== productId
                )
            );
        } catch (error) {
            console.error("Delete product error:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete product."
            );
        }
    };

    /* ================================
       UPDATE ORDER STATUS
    ================================= */

    const updateOrderStatus = async (
        orderId: string,
        status: OrderStatus
    ) => {
        if (!token) {
            setError("You are not logged in.");
            return;
        }

        try {
            setUpdatingOrder(orderId);
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/api/orders/${orderId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update order status."
                );
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.orderId === orderId
                        ? {
                            ...order,
                            status: data.order.status,
                            paymentStatus:
                                data.order.paymentStatus,
                        }
                        : order
                )
            );

            setSuccess(
                `Order ${orderId} updated to "${status}".`
            );

            window.dispatchEvent(
                new Event("order-status-updated")
            );
        } catch (error) {
            console.error(
                "Update order status error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update order status."
            );
        } finally {
            setUpdatingOrder("");
        }
    };

    /* ================================
       STATUS BUTTONS
    ================================= */

    const renderStatusButtons = (order: Order) => {
        if (order.status === "Delivered") {
            return (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <CheckCircle size={17} />
                    Order Delivered
                </div>
            );
        }

        if (order.status === "Cancelled") {
            return (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    <XCircle size={17} />
                    Order Cancelled
                </div>
            );
        }

        if (order.status === "Order Placed") {
            return (
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        disabled={updatingOrder === order.orderId}
                        onClick={() =>
                            updateOrderStatus(
                                order.orderId,
                                "Accepted"
                            )
                        }
                        className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-green-600 disabled:opacity-50"
                    >
                        <CheckCircle size={15} />
                        {updatingOrder === order.orderId
                            ? "Updating..."
                            : "Accept Order"}
                    </button>

                    <button
                        type="button"
                        disabled={updatingOrder === order.orderId}
                        onClick={() =>
                            updateOrderStatus(
                                order.orderId,
                                "Cancelled"
                            )
                        }
                        className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                    >
                        <XCircle size={15} />
                        Cancel
                    </button>
                </div>
            );
        }

        if (order.status === "Accepted") {
            return (
                <button
                    type="button"
                    disabled={updatingOrder === order.orderId}
                    onClick={() =>
                        updateOrderStatus(
                            order.orderId,
                            "Preparing"
                        )
                    }
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                    <Clock size={15} />
                    {updatingOrder === order.orderId
                        ? "Updating..."
                        : "Start Preparing"}
                </button>
            );
        }

        if (order.status === "Preparing") {
            return (
                <button
                    type="button"
                    disabled={updatingOrder === order.orderId}
                    onClick={() =>
                        updateOrderStatus(
                            order.orderId,
                            "Out for Delivery"
                        )
                    }
                    className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                    <Truck size={15} />
                    {updatingOrder === order.orderId
                        ? "Updating..."
                        : "Out for Delivery"}
                </button>
            );
        }

        if (order.status === "Out for Delivery") {
            return (
                <button
                    type="button"
                    disabled={updatingOrder === order.orderId}
                    onClick={() =>
                        updateOrderStatus(
                            order.orderId,
                            "Delivered"
                        )
                    }
                    className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-green-600 disabled:opacity-50"
                >
                    <CheckCircle size={15} />
                    {updatingOrder === order.orderId
                        ? "Updating..."
                        : "Mark Delivered"}
                </button>
            );
        }

        return null;
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">

            {/* HEADER */}

            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white">
                        <Store size={24} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                            {shop
                                ? shop.name
                                : "Shop Dashboard"}
                        </h1>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage your{" "}
                            {shop?.type === "stationery"
                                ? "stationery"
                                : "food"}{" "}
                            products and orders
                        </p>
                    </div>
                </div>
            </div>

            {/* SUCCESS */}

            {success && (
                <div className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    {success}
                </div>
            )}

            {/* ERROR */}

            {error && (
                <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* ADD PRODUCT */}

            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

                <div className="mb-5 flex items-center gap-2">
                    <Plus
                        size={20}
                        className="text-red-500"
                    />

                    <h2 className="text-lg font-black text-gray-900 dark:text-white">
                        Add Product
                    </h2>
                </div>

                <form
                    onSubmit={handleAddProduct}
                    className="grid gap-4 md:grid-cols-2"
                >

                    {/* PRODUCT NAME */}

                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                            Product Name *
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="e.g. Masala Maggi"
                            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                    </div>

                    {/* PRICE */}

                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                            Price (₹) *
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={price}
                            onChange={(e) =>
                                setPrice(e.target.value)
                            }
                            placeholder="e.g. 50"
                            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                    </div>

                    {/* CATEGORY */}

                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                            Category *
                        </label>

                        <input
                            type="text"
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                            placeholder={
                                shop?.type === "stationery"
                                    ? "e.g. Notebooks"
                                    : "e.g. Snacks"
                            }
                            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                    </div>

                    {/* IMAGE */}

                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                            Image URL
                        </label>

                        <input
                            type="url"
                            value={image}
                            onChange={(e) =>
                                setImage(e.target.value)
                            }
                            placeholder="https://..."
                            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                    </div>

                    {/* DESCRIPTION */}

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            placeholder="Short product description"
                            rows={3}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-red-400 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        />
                    </div>

                    {/* ADD BUTTON */}

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={adding}
                            className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Plus size={18} />

                            {adding
                                ? "Adding..."
                                : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>

            {/* PRODUCTS */}

            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package
                            size={20}
                            className="text-red-500"
                        />

                        <h2 className="text-lg font-black text-gray-900 dark:text-white">
                            Your Products
                        </h2>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {products.length} Products
                    </span>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-sm font-semibold text-gray-500">
                        Loading products...
                    </div>
                ) : products.length === 0 ? (
                    <div className="rounded-xl bg-gray-50 py-12 text-center dark:bg-gray-950">
                        <Package
                            size={40}
                            className="mx-auto mb-3 text-gray-400"
                        />

                        <p className="font-bold text-gray-700 dark:text-gray-300">
                            No products yet
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Add your first product using the
                            form above.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950"
                            >
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-40 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-40 items-center justify-center bg-gray-100 dark:bg-gray-800">
                                        <Package
                                            size={40}
                                            className="text-gray-400"
                                        />
                                    </div>
                                )}

                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white">
                                                {product.name}
                                            </h3>

                                            <p className="mt-1 text-xs font-semibold text-gray-500">
                                                {product.category}
                                            </p>
                                        </div>

                                        <span className="whitespace-nowrap text-sm font-black text-red-500">
                                            ₹{product.price}
                                        </span>
                                    </div>

                                    {product.description && (
                                        <p className="mt-3 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                                            {product.description}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteProduct(
                                                product._id
                                            )
                                        }
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                                    >
                                        <Trash2 size={16} />
                                        Delete Product
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* =====================================================
                ORDERS
            ====================================================== */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">

                <div className="mb-6 flex items-center justify-between">

                    <div className="flex items-center gap-2">
                        <ShoppingBag
                            size={20}
                            className="text-red-500"
                        />

                        <h2 className="text-lg font-black text-gray-900 dark:text-white">
                            Customer Orders
                        </h2>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {orders.length} Orders
                    </span>
                </div>

                {ordersLoading ? (
                    <div className="py-10 text-center text-sm font-semibold text-gray-500">
                        Loading orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-xl bg-gray-50 py-12 text-center dark:bg-gray-950">
                        <ShoppingBag
                            size={40}
                            className="mx-auto mb-3 text-gray-400"
                        />

                        <p className="font-bold text-gray-700 dark:text-gray-300">
                            No customer orders yet
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            New orders from your shop will
                            appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">

                        {orders.map((order) => (

                            <div
                                key={order._id}
                                className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950"
                            >

                                {/* ORDER HEADER */}

                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">

                                            <h3 className="font-black text-gray-900 dark:text-white">
                                                {order.orderId}
                                            </h3>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-black ${order.status ===
                                                    "Delivered"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                                    : order.status ===
                                                        "Cancelled"
                                                        ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                                        : order.status ===
                                                            "Out for Delivery"
                                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                                            : "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="text-left md:text-right">
                                        <p className="text-xs font-semibold text-gray-500">
                                            Total
                                        </p>

                                        <p className="text-xl font-black text-red-500">
                                            ₹{order.total}
                                        </p>
                                    </div>
                                </div>

                                {/* CUSTOMER */}

                                <div className="mt-5 rounded-xl bg-white p-4 dark:bg-gray-900">

                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                        Customer
                                    </p>

                                    <p className="mt-1 font-black text-gray-900 dark:text-white">
                                        {order.customerName}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        📞 {order.phone}
                                    </p>

                                    {order.email && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            ✉️ {order.email}
                                        </p>
                                    )}

                                    <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        📍 {order.deliveryLocation}
                                        {order.room
                                            ? ` • ${order.room}`
                                            : ""}
                                    </p>

                                    {order.instructions && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Note:{" "}
                                            {order.instructions}
                                        </p>
                                    )}
                                </div>

                                {/* ITEMS */}

                                <div className="mt-4">

                                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                                        Ordered Items
                                    </p>

                                    <div className="space-y-2">

                                        {order.items.map(
                                            (item, index) => (
                                                <div
                                                    key={`${order.orderId}-${item.productId}-${index}`}
                                                    className="flex items-center justify-between rounded-xl bg-white px-4 py-3 dark:bg-gray-900"
                                                >
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">
                                                            {item.name}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            ₹
                                                            {item.price} ×{" "}
                                                            {item.quantity}
                                                        </p>
                                                    </div>

                                                    <p className="font-black text-gray-900 dark:text-white">
                                                        ₹
                                                        {item.price *
                                                            item.quantity}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* PAYMENT */}

                                <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-gray-500">
                                    <span>
                                        Payment:{" "}
                                        {order.paymentMethod}
                                    </span>

                                    <span>
                                        Status:{" "}
                                        {order.paymentStatus}
                                    </span>

                                    <span>
                                        ETA: {order.eta}
                                    </span>
                                </div>

                                {/* ACTIONS */}

                                <div className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-700">
                                    {renderStatusButtons(order)}
                                </div>

                            </div>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
}

export default ShopOwnerDashboard;