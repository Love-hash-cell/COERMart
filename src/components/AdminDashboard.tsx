import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Package,
    ShieldCheck,
    Store,
    Truck,
    UserPlus,
    XCircle,
    Edit,
    KeyRound,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { API_URL } from "../utils/config";

interface AdminDashboardProps {
    onBack: () => void;
}

interface Shop {
    _id: string;
    name: string;
    type: "food" | "stationery";
    ownerId?: string | null;
}

interface ShopOwner {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: "shop_owner";
    shopId?: {
        _id: string;
        name: string;
        type: "food" | "stationery";
    } | null;
    isActive?: boolean;
}

interface OwnerForm {
    name: string;
    email: string;
    phone: string;
    password: string;
    shopId: string;
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
    image?: string;
}

interface AdminOrder {
    orderId: string;
    userId?: string;
    shopId?: string | {
        _id: string;
        name: string;
    };
    items: OrderItem[];
    total: number;
    customerName: string;
    phone: string;
    email?: string;
    deliveryLocation: string;
    room?: string;
    instructions?: string;
    status: OrderStatus;
    paymentMethod?: string;
    paymentStatus?: string;
    eta?: string;
    createdAt: string;
    updatedAt?: string;
}

function AdminDashboard({ onBack }: AdminDashboardProps) {
    const [shops, setShops] = useState<Shop[]>([]);
    const [owners, setOwners] = useState<ShopOwner[]>([]);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const [showOwnerForm, setShowOwnerForm] = useState(false);
    const [editingOwner, setEditingOwner] = useState<ShopOwner | null>(null);
    const [showPasswordForm, setShowPasswordForm] =
        useState<ShopOwner | null>(null);

    const [ownerForm, setOwnerForm] = useState<OwnerForm>({
        name: "",
        email: "",
        phone: "",
        password: "",
        shopId: "",
    });

    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [showCreateShop, setShowCreateShop] = useState(false);
    const [newShopName, setNewShopName] = useState("");
    const [newShopType, setNewShopType] =
        useState<"food" | "stationery">("food");
    const [creatingShop, setCreatingShop] = useState(false);

    // ONLY AUTH STORAGE CHANGE:
    // localStorage -> sessionStorage
    const token = sessionStorage.getItem("coermart_token");

    // =====================================================
    // FETCH SHOPS
    // =====================================================
    const fetchShops = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/shops`
            );

            const data = await response.json();

            if (response.ok) {
                setShops(data);
            }
        } catch (err) {
            console.error("Fetch shops error:", err);
        }
    };

    // =====================================================
    // FETCH SHOP OWNERS
    // =====================================================
    const fetchOwners = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/admin/shop-owners`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setOwners(data);
            } else {
                setError(data.message || "Failed to fetch shop owners.");
            }
        } catch (err) {
            console.error("Fetch owners error:", err);
            setError("Unable to fetch shop owners.");
        }
    };

    // =====================================================
    // FETCH ALL ORDERS FROM MONGODB
    // =====================================================
    const fetchOrders = async () => {
        setOrdersLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/orders/admin/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to fetch orders.");
                return;
            }

            const orderList = Array.isArray(data)
                ? data
                : data.orders || [];

            setOrders(orderList);
        } catch (err) {
            console.error("Fetch admin orders error:", err);
            setError("Unable to fetch customer orders.");
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
        fetchOwners();
        fetchOrders();
    }, []);

    // =====================================================
    // CREATE SHOP OWNER
    // =====================================================
    const handleCreateOwner = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/shop-owner`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(ownerForm),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to create shop owner.");
                return;
            }

            setMessage("Shop owner created successfully.");

            setOwnerForm({
                name: "",
                email: "",
                phone: "",
                password: "",
                shopId: "",
            });

            setShowOwnerForm(false);

            await fetchShops();
            await fetchOwners();
        } catch (err) {
            console.error("Create owner error:", err);
            setError("Server error while creating shop owner.");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // CREATE NEW SHOP
    // =====================================================
    const handleCreateShop = async () => {
        if (!newShopName.trim()) {
            setError("Please enter a shop name.");
            return;
        }

        setCreatingShop(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/shops/admin`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: newShopName.trim(),
                        type: newShopType,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to create shop.");
                return;
            }

            setShops((prev) => [...prev, data.shop]);

            setOwnerForm((prev) => ({
                ...prev,
                shopId: data.shop._id,
            }));

            setMessage("Shop created successfully.");
            setNewShopName("");
            setNewShopType("food");
            setShowCreateShop(false);
        } catch (err) {
            console.error("Create shop error:", err);
            setError("Server error while creating shop.");
        } finally {
            setCreatingShop(false);
        }
    };

    // =====================================================
    // OPEN EDIT FORM
    // =====================================================
    const openEditOwner = (owner: ShopOwner) => {
        setEditingOwner(owner);

        setOwnerForm({
            name: owner.name,
            email: owner.email,
            phone: owner.phone || "",
            password: "",
            shopId: owner.shopId?._id || "",
        });

        setMessage("");
        setError("");
    };

    // =====================================================
    // UPDATE SHOP OWNER
    // =====================================================
    const handleUpdateOwner = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!editingOwner) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/shop-owner/${editingOwner._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: ownerForm.name,
                        email: ownerForm.email,
                        phone: ownerForm.phone,
                        shopId: ownerForm.shopId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to update shop owner.");
                return;
            }

            setMessage("Shop owner updated successfully.");

            setEditingOwner(null);

            setOwnerForm({
                name: "",
                email: "",
                phone: "",
                password: "",
                shopId: "",
            });

            await fetchShops();
            await fetchOwners();
        } catch (err) {
            console.error("Update owner error:", err);
            setError("Server error while updating shop owner.");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================
    const handleChangePassword = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!showPasswordForm) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/shop-owner/${showPasswordForm._id}/password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        password: newPassword,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to change password.");
                return;
            }

            setMessage("Password changed successfully.");

            setNewPassword("");
            setShowPasswordForm(null);
        } catch (err) {
            console.error("Change password error:", err);
            setError("Server error while changing password.");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // REMOVE SHOP OWNER
    // =====================================================
    const handleRemoveOwner = async (owner: ShopOwner) => {
        const confirmed = window.confirm(
            `Remove ${owner.name} as the owner of ${owner.shopId?.name || "this shop"
            }?`
        );

        if (!confirmed) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/admin/shop-owner/${owner._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to remove shop owner.");
                return;
            }

            setMessage("Shop owner removed successfully.");

            await fetchShops();
            await fetchOwners();
        } catch (err) {
            console.error("Remove owner error:", err);
            setError("Server error while removing shop owner.");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // ORDER STATS
    // =====================================================
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
        (order) =>
            order.status === "Order Placed" ||
            order.status === "Accepted" ||
            order.status === "Preparing"
    ).length;

    const outForDelivery = orders.filter(
        (order) => order.status === "Out for Delivery"
    ).length;

    const deliveredOrders = orders.filter(
        (order) => order.status === "Delivered"
    ).length;

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
            <div className="mx-auto max-w-7xl">

                {/* =====================================================
                    HEADER
                ===================================================== */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <ShieldCheck
                                size={26}
                                className="text-red-500"
                            />

                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                                Admin Dashboard
                            </h1>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage shop owners and campus orders
                        </p>
                    </div>

                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    >
                        <ArrowLeft size={17} />
                        Back to Store
                    </button>
                </div>

                {/* =====================================================
                    MESSAGE
                ===================================================== */}
                {message && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
                        <CheckCircle size={18} />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                        <XCircle size={18} />
                        {error}

                        <button
                            onClick={() => setError("")}
                            className="ml-auto"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* =====================================================
                    ORDER STATS
                ===================================================== */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 flex items-center justify-between">
                            <Package className="text-blue-500" />

                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                {totalOrders}
                            </span>
                        </div>

                        <p className="text-sm font-semibold text-gray-500">
                            Total Orders
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 flex items-center justify-between">
                            <Clock className="text-orange-500" />

                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                {pendingOrders}
                            </span>
                        </div>

                        <p className="text-sm font-semibold text-gray-500">
                            Pending Orders
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 flex items-center justify-between">
                            <Truck className="text-purple-500" />

                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                {outForDelivery}
                            </span>
                        </div>

                        <p className="text-sm font-semibold text-gray-500">
                            Out for Delivery
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 flex items-center justify-between">
                            <CheckCircle className="text-green-500" />

                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                {deliveredOrders}
                            </span>
                        </div>

                        <p className="text-sm font-semibold text-gray-500">
                            Delivered
                        </p>
                    </div>
                </div>

                {/* =====================================================
                    SHOP OWNER MANAGEMENT
                ===================================================== */}
                <div className="mb-8 rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-6 dark:border-gray-800">
                        <div>
                            <div className="flex items-center gap-2">
                                <Store
                                    size={21}
                                    className="text-red-500"
                                />

                                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                    Shop Owner Management
                                </h2>
                            </div>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Create and manage individual shop owner accounts
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setShowOwnerForm(!showOwnerForm);
                                setEditingOwner(null);
                                setMessage("");
                                setError("");
                            }}
                            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
                        >
                            <UserPlus size={17} />
                            Create Shop Owner
                        </button>
                    </div>

                    {/* CREATE OWNER FORM */}
                    {showOwnerForm && (
                        <form
                            onSubmit={handleCreateOwner}
                            className="border-b border-gray-100 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950"
                        >
                            <div className="grid gap-4 md:grid-cols-2">

                                <input
                                    type="text"
                                    placeholder="Owner Name"
                                    value={ownerForm.name}
                                    onChange={(e) =>
                                        setOwnerForm({
                                            ...ownerForm,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />

                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={ownerForm.email}
                                    onChange={(e) =>
                                        setOwnerForm({
                                            ...ownerForm,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />

                                <input
                                    type="text"
                                    placeholder="Phone"
                                    value={ownerForm.phone}
                                    onChange={(e) =>
                                        setOwnerForm({
                                            ...ownerForm,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />

                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={ownerForm.password}
                                    onChange={(e) =>
                                        setOwnerForm({
                                            ...ownerForm,
                                            password: e.target.value,
                                        })
                                    }
                                    required
                                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />

                                <div className="md:col-span-2">
                                    <select
                                        value={ownerForm.shopId}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (value === "__CREATE_NEW_SHOP__") {
                                                setShowCreateShop(true);
                                                setOwnerForm({
                                                    ...ownerForm,
                                                    shopId: "",
                                                });
                                                return;
                                            }

                                            setShowCreateShop(false);
                                            setOwnerForm({
                                                ...ownerForm,
                                                shopId: value,
                                            });
                                        }}
                                        required={!showCreateShop}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    >
                                        <option value="">
                                            Select Shop
                                        </option>

                                        {shops.map((shop) => (
                                            <option
                                                key={shop._id}
                                                value={shop._id}
                                                disabled={Boolean(shop.ownerId)}
                                            >
                                                {shop.name}
                                                {shop.ownerId
                                                    ? " — Already has owner"
                                                    : ""}
                                            </option>
                                        ))}

                                        <option value="__CREATE_NEW_SHOP__">
                                            + Create New Shop
                                        </option>
                                    </select>

                                    {showCreateShop && (
                                        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                                            <div className="grid gap-3 md:grid-cols-2">
                                                <input
                                                    type="text"
                                                    placeholder="New Shop Name"
                                                    value={newShopName}
                                                    onChange={(e) =>
                                                        setNewShopName(e.target.value)
                                                    }
                                                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                />

                                                <select
                                                    value={newShopType}
                                                    onChange={(e) =>
                                                        setNewShopType(
                                                            e.target.value as
                                                            | "food"
                                                            | "stationery"
                                                        )
                                                    }
                                                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                >
                                                    <option value="food">
                                                        Food
                                                    </option>
                                                    <option value="stationery">
                                                        Stationery
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="mt-3 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleCreateShop}
                                                    disabled={creatingShop}
                                                    className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                                                >
                                                    {creatingShop
                                                        ? "Creating..."
                                                        : "Create Shop"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowCreateShop(false);
                                                        setNewShopName("");
                                                        setNewShopType("food");
                                                        setOwnerForm({
                                                            ...ownerForm,
                                                            shopId: "",
                                                        });
                                                    }}
                                                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 dark:border-gray-700 dark:text-gray-200"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                    {loading
                                        ? "Creating..."
                                        : "Create Owner"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowOwnerForm(false)}
                                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 dark:border-gray-700 dark:text-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* OWNER LIST */}
                    <div className="p-6">
                        {owners.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
                                <Store
                                    size={35}
                                    className="mx-auto mb-3 text-gray-400"
                                />

                                <p className="font-bold text-gray-600 dark:text-gray-300">
                                    No shop owners found
                                </p>

                                <p className="mt-1 text-sm text-gray-400">
                                    Create a shop owner account to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {owners.map((owner) => (
                                    <div
                                        key={owner._id}
                                        className="rounded-2xl border border-gray-100 p-5 dark:border-gray-800"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-black text-gray-900 dark:text-white">
                                                    {owner.name}
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {owner.email}
                                                </p>

                                                {owner.phone && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {owner.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600 dark:bg-green-950/30 dark:text-green-400">
                                                Shop Owner
                                            </span>
                                        </div>

                                        <div className="mt-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                                            <p className="text-xs font-semibold text-gray-400">
                                                Assigned Shop
                                            </p>

                                            <p className="mt-1 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-white">
                                                <Store size={15} />
                                                {owner.shopId?.name ||
                                                    "No shop assigned"}
                                            </p>

                                            {owner.shopId?.type && (
                                                <p className="mt-1 text-xs capitalize text-gray-500">
                                                    {owner.shopId.type}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditOwner(owner)
                                                }
                                                className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950/30"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setShowPasswordForm(owner);
                                                    setNewPassword("");
                                                    setMessage("");
                                                    setError("");
                                                }}
                                                className="flex items-center gap-1.5 rounded-lg border border-orange-200 px-3 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 dark:border-orange-900 dark:hover:bg-orange-950/30"
                                            >
                                                <KeyRound size={14} />
                                                Password
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleRemoveOwner(owner)
                                                }
                                                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                                            >
                                                <Trash2 size={14} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    EDIT OWNER MODAL
                ===================================================== */}
                {editingOwner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                        Edit Shop Owner
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Update owner details and assigned shop
                                    </p>
                                </div>

                                <button
                                    onClick={() => setEditingOwner(null)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleUpdateOwner}
                                className="space-y-4"
                            >
                                <input
                                    type="text"
                                    placeholder="Owner Name"
                                    value={ownerForm.name}
                                    onChange={(e) =>
                                        setOwnerForm({
                                            ...ownerForm,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />

                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={ownerForm.email}
                                    onChange={(e) =>
                                        setOwnerForm({
                                            ...ownerForm,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />

                                <input
                                    type="text"
                                    placeholder="Phone"
                                    value={ownerForm.phone}
                                    onChange={(e) =>
                                        setOwnerForm({
                                            ...ownerForm,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />

                                <select
                                    value={ownerForm.shopId}
                                    onChange={(e) =>
                                        setOwnerForm({
                                            ...ownerForm,
                                            shopId: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                >
                                    <option value="">
                                        Select Shop
                                    </option>

                                    {shops.map((shop) => {
                                        const isCurrentShop =
                                            shop._id ===
                                            editingOwner.shopId?._id;

                                        const hasOtherOwner =
                                            Boolean(shop.ownerId) &&
                                            !isCurrentShop;

                                        return (
                                            <option
                                                key={shop._id}
                                                value={shop._id}
                                                disabled={hasOtherOwner}
                                            >
                                                {shop.name}
                                                {hasOtherOwner
                                                    ? " — Already has owner"
                                                    : ""}
                                            </option>
                                        );
                                    })}
                                </select>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                                    >
                                        {loading
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingOwner(null)
                                        }
                                        className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 dark:border-gray-700 dark:text-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* =====================================================
                    PASSWORD MODAL
                ===================================================== */}
                {showPasswordForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                        Change Password
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {showPasswordForm.name}
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setShowPasswordForm(null)
                                    }
                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form
                                onSubmit={handleChangePassword}
                                className="space-y-4"
                            >
                                <input
                                    type="password"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    minLength={6}
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                                    >
                                        {loading
                                            ? "Changing..."
                                            : "Change Password"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswordForm(null)
                                        }
                                        className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 dark:border-gray-700 dark:text-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* =====================================================
                    ORDERS
                ===================================================== */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">
                            Order Management
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            View customer orders from all shops
                        </p>
                    </div>

                    <div className="p-6">
                        {ordersLoading ? (
                            <div className="py-10 text-center">
                                <Clock
                                    size={40}
                                    className="mx-auto mb-3 animate-spin text-gray-400"
                                />

                                <p className="font-bold text-gray-600 dark:text-gray-300">
                                    Loading orders...
                                </p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="py-10 text-center">
                                <Package
                                    size={40}
                                    className="mx-auto mb-3 text-gray-400"
                                />

                                <p className="font-bold text-gray-600 dark:text-gray-300">
                                    No orders yet
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.orderId}
                                        className="rounded-xl border border-gray-100 p-5 dark:border-gray-800"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white">
                                                    Order #{order.orderId}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {order.customerName}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    {order.phone}
                                                </p>

                                                {order.email && (
                                                    <p className="text-sm text-gray-500">
                                                        {order.email}
                                                    </p>
                                                )}

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {order.deliveryLocation}
                                                    {order.room
                                                        ? ` • ${order.room}`
                                                        : ""}
                                                </p>

                                                {order.shopId &&
                                                    typeof order.shopId ===
                                                    "object" && (
                                                        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-400">
                                                            <Store size={13} />
                                                            {order.shopId.name}
                                                        </p>
                                                    )}

                                                <p className="mt-1 text-xs text-gray-400">
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-black text-gray-900 dark:text-white">
                                                    ₹{order.total}
                                                </p>

                                                <span
                                                    className={`text-xs font-bold ${order.status ===
                                                        "Delivered"
                                                        ? "text-green-500"
                                                        : order.status ===
                                                            "Cancelled"
                                                            ? "text-red-500"
                                                            : "text-orange-500"
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ORDER ITEMS */}
                                        <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                                            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                                                Items
                                            </p>

                                            <div className="space-y-2">
                                                {order.items?.map(
                                                    (item, index) => (
                                                        <div
                                                            key={`${order.orderId}-${index}`}
                                                            className="flex items-center justify-between gap-3 text-sm"
                                                        >
                                                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                                {item.name} ×{" "}
                                                                {
                                                                    item.quantity
                                                                }
                                                            </span>

                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                ₹
                                                                {item.price *
                                                                    item.quantity}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* PAYMENT + ETA */}
                                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                                            {order.paymentMethod && (
                                                <span>
                                                    Payment:{" "}
                                                    <strong>
                                                        {
                                                            order.paymentMethod
                                                        }
                                                    </strong>
                                                </span>
                                            )}

                                            {order.paymentStatus && (
                                                <span>
                                                    Payment Status:{" "}
                                                    <strong>
                                                        {
                                                            order.paymentStatus
                                                        }
                                                    </strong>
                                                </span>
                                            )}

                                            {order.eta && (
                                                <span>
                                                    ETA:{" "}
                                                    <strong>{order.eta}</strong>
                                                </span>
                                            )}
                                        </div>

                                        {order.instructions && (
                                            <div className="mt-3 rounded-lg border border-gray-100 px-3 py-2 text-xs text-gray-500 dark:border-gray-700">
                                                <strong>
                                                    Instructions:
                                                </strong>{" "}
                                                {order.instructions}
                                            </div>
                                        )}

                                        {/* CURRENT STATUS */}
                                        <div className="mt-4 flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-400">
                                                Current Status:
                                            </span>

                                            <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;