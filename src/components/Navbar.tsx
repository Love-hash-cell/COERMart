import {
    ChevronDown,
    LogOut,
    MapPin,
    Menu,
    Moon,
    Search,
    ShoppingCart,
    ShieldCheck,
    Sun,
    User,
    UserCircle,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import OrderTracking from "./OrderTracking";
import CartDrawer from "./CartDrawer";

interface NavbarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}

interface LoggedInUser {
    name: string;
    email: string;
    role: "customer" | "user" | "admin" | "shop_owner";
}

function Navbar({
    searchTerm,
    setSearchTerm,
}: NavbarProps) {
    const { cartCount } = useCart();

    const [darkMode, setDarkMode] = useState(() => {
        return (
            localStorage.getItem("coermart_theme") === "dark"
        );
    });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [loggedInUser, setLoggedInUser] =
        useState<LoggedInUser | null>(null);

    const [cartOpen, setCartOpen] = useState(false);
    const [openCartAfterLogin, setOpenCartAfterLogin] =
        useState(false);

    const [ordersOpen, setOrdersOpen] = useState(false);

    /* =========================
       AUTH SYNC
    ========================= */
    useEffect(() => {
        const syncAuth = () => {
            try {
                const savedUser =
                    sessionStorage.getItem("coermart_user");

                if (savedUser) {
                    const parsedUser = JSON.parse(savedUser);

                    setLoggedInUser({
                        name: parsedUser.name,
                        email: parsedUser.email,
                        role: parsedUser.role,
                    });
                } else {
                    setLoggedInUser(null);
                }
            } catch {
                setLoggedInUser(null);
            }
        };

        syncAuth();

        window.addEventListener(
            "auth-changed",
            syncAuth
        );

        return () => {
            window.removeEventListener(
                "auth-changed",
                syncAuth
            );
        };
    }, []);

    /* =========================
       OPEN CART AFTER LOGIN
    ========================= */
    useEffect(() => {
        if (
            loggedInUser &&
            openCartAfterLogin
        ) {
            setCartOpen(true);
            setOpenCartAfterLogin(false);
        }
    }, [
        loggedInUser,
        openCartAfterLogin,
    ]);

    /* =========================
       OPEN ORDER TRACKING EVENT
    ========================= */
    useEffect(() => {
        const handleOpenOrderTracking = () => {
            setOrdersOpen(true);
            setUserMenuOpen(false);
            setMobileMenuOpen(false);
            setCartOpen(false);
        };

        window.addEventListener(
            "open-order-tracking",
            handleOpenOrderTracking
        );

        return () => {
            window.removeEventListener(
                "open-order-tracking",
                handleOpenOrderTracking
            );
        };
    }, []);

    /* =========================
       DARK MODE
    ========================= */
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");

            localStorage.setItem(
                "coermart_theme",
                "dark"
            );
        } else {
            document.documentElement.classList.remove("dark");

            localStorage.setItem(
                "coermart_theme",
                "light"
            );
        }
    }, [darkMode]);

    /* =========================
       OPEN LOGIN
    ========================= */
    const openLogin = () => {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);

        window.dispatchEvent(
            new Event("open-login")
        );
    };

    /* =========================
       CART BUTTON
    ========================= */
    const handleCartClick = () => {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);

        if (loggedInUser) {
            setCartOpen(true);
        } else {
            setOpenCartAfterLogin(true);
            openLogin();
        }
    };

    /* =========================
       CLOSE CART
    ========================= */
    const closeCart = () => {
        setCartOpen(false);
    };

    /* =========================
       OPEN MY ORDERS
    ========================= */
    const openOrders = () => {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
        setOrdersOpen(true);
        setCartOpen(false);
    };

    /* =========================
       CLOSE MY ORDERS
    ========================= */
    const closeOrders = () => {
        setOrdersOpen(false);
    };

    /* =========================
       OPEN ADMIN DASHBOARD
    ========================= */
    const openAdminDashboard = () => {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);

        window.dispatchEvent(
            new Event("open-admin-dashboard")
        );
    };

    /* =========================
       OPEN SHOP OWNER DASHBOARD
    ========================= */
    const openShopOwnerDashboard = () => {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);

        window.dispatchEvent(
            new Event("open-shop-owner-dashboard")
        );
    };

    /* =========================
       LOGOUT
    ========================= */
    const handleLogout = () => {
        sessionStorage.removeItem(
            "coermart_logged_in"
        );

        sessionStorage.removeItem(
            "coermart_user_role"
        );

        sessionStorage.removeItem(
            "coermart_user_name"
        );

        sessionStorage.removeItem(
            "coermart_user_email"
        );

        sessionStorage.removeItem(
            "coermart_user"
        );

        sessionStorage.removeItem(
            "coermart_token"
        );

        setLoggedInUser(null);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
        setOrdersOpen(false);
        setCartOpen(false);
        setOpenCartAfterLogin(false);

        window.dispatchEvent(
            new Event("auth-changed")
        );
    };

    /* =========================
       SEARCH
    ========================= */
    const handleSearchChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTerm(e.target.value);
    };

    /* =========================
       SEARCH SUBMIT
       ENTER = SAME SEARCH ACTION
    ========================= */
    const handleSearchSubmit = (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setSearchTerm(searchTerm.trim());
    };

    return (
        <>
            {/* =========================
                NAVBAR
            ========================= */}
            <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="flex h-20 items-center justify-between gap-4">

                        {/* LOGO */}
                        <button
                            type="button"
                            onClick={() => {
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                });
                            }}
                            className="flex shrink-0 items-center gap-3"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
                                <ShoppingCart
                                    size={23}
                                    className="text-white"
                                />
                            </div>

                            <div className="hidden text-left sm:block">
                                <div className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                                    COER
                                    <span className="text-red-500">
                                        Mart
                                    </span>
                                </div>

                                <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                    Campus Delivery
                                </div>
                            </div>
                        </button>

                        {/* DESKTOP SEARCH */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="hidden max-w-xl flex-1 md:block"
                        >
                            <div className="relative">

                                <Search
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={
                                        handleSearchChange
                                    }
                                    placeholder="Search food, stationery..."
                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-12 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-red-500"
                                />

                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearchTerm("")
                                        }
                                        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* RIGHT SIDE */}
                        <div className="flex items-center gap-2">

                            {/* LOCATION */}
                            <div className="hidden items-center gap-2 rounded-xl px-3 py-2 lg:flex">
                                <MapPin
                                    size={18}
                                    className="text-red-500"
                                />

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                        Deliver to
                                    </p>

                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        COER University
                                    </p>
                                </div>
                            </div>

                            {/* THEME TOGGLE */}
                            <button
                                type="button"
                                onClick={() =>
                                    setDarkMode(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                className="hidden h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 md:flex dark:text-gray-300 dark:hover:bg-gray-800"
                                aria-label="Toggle theme"
                            >
                                {darkMode ? (
                                    <Sun size={19} />
                                ) : (
                                    <Moon size={19} />
                                )}
                            </button>

                            {/* CART */}
                            <button
                                type="button"
                                onClick={
                                    handleCartClick
                                }
                                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                aria-label="Open cart"
                            >
                                <ShoppingCart size={20} />

                                {cartCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                                        {cartCount > 99
                                            ? "99+"
                                            : cartCount}
                                    </span>
                                )}
                            </button>

                            {/* USER / LOGIN */}
                            {loggedInUser ? (
                                <div className="relative">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setUserMenuOpen(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        className="flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                                            {loggedInUser.role ===
                                                "admin" ? (
                                                <ShieldCheck
                                                    size={19}
                                                />
                                            ) : (
                                                <User size={19} />
                                            )}
                                        </div>

                                        <div className="hidden text-left sm:block">
                                            <p className="max-w-[110px] truncate text-xs font-bold text-gray-900 dark:text-white">
                                                {
                                                    loggedInUser.name
                                                }
                                            </p>

                                            <p className="text-[10px] font-medium capitalize text-gray-400">
                                                {loggedInUser.role ===
                                                    "admin"
                                                    ? "Administrator"
                                                    : loggedInUser.role ===
                                                        "shop_owner"
                                                        ? "Shop Owner"
                                                        : "Student"}
                                            </p>
                                        </div>

                                        <ChevronDown
                                            size={15}
                                            className={`hidden text-gray-400 transition sm:block ${userMenuOpen
                                                ? "rotate-180"
                                                : ""
                                                }`}
                                        />
                                    </button>

                                    {/* USER DROPDOWN */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">

                                            <div className="border-b border-gray-100 px-4 py-4 dark:border-gray-800">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                                                        {loggedInUser.role ===
                                                            "admin" ? (
                                                            <ShieldCheck
                                                                size={
                                                                    21
                                                                }
                                                            />
                                                        ) : (
                                                            <UserCircle
                                                                size={
                                                                    22
                                                                }
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm font-black text-gray-900 dark:text-white">
                                                            {
                                                                loggedInUser.name
                                                            }
                                                        </p>

                                                        <p className="truncate text-xs text-gray-400">
                                                            {
                                                                loggedInUser.email
                                                            }
                                                        </p>

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2">

                                                {/* MY ORDERS */}
                                                {(loggedInUser.role ===
                                                    "customer" ||
                                                    loggedInUser.role ===
                                                    "user") && (
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                openOrders
                                                            }
                                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                                        >
                                                            <ShoppingCart
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                            My Orders
                                                        </button>
                                                    )}

                                                {/* ADMIN DASHBOARD */}
                                                {loggedInUser.role ===
                                                    "admin" && (
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                openAdminDashboard
                                                            }
                                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                                        >
                                                            <ShieldCheck
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                            Admin Dashboard
                                                        </button>
                                                    )}

                                                {/* SHOP OWNER DASHBOARD */}
                                                {loggedInUser.role ===
                                                    "shop_owner" && (
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                openShopOwnerDashboard
                                                            }
                                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                                        >
                                                            <StoreIcon />
                                                            Shop Owner Dashboard
                                                        </button>
                                                    )}

                                                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                                                {/* LOGOUT */}
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleLogout
                                                    }
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                                >
                                                    <LogOut
                                                        size={
                                                            18
                                                        }
                                                    />
                                                    Logout
                                                </button>

                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* LOGIN BUTTON */
                                <button
                                    type="button"
                                    onClick={openLogin}
                                    className="hidden items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 sm:flex"
                                >
                                    <User size={17} />
                                    Login
                                </button>
                            )}

                            {/* MOBILE MENU BUTTON */}
                            <button
                                type="button"
                                onClick={() =>
                                    setMobileMenuOpen(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-100 md:hidden dark:text-gray-200 dark:hover:bg-gray-800"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X size={21} />
                                ) : (
                                    <Menu size={21} />
                                )}
                            </button>

                        </div>
                    </div>

                    {/* MOBILE SEARCH */}
                    <form
                        onSubmit={handleSearchSubmit}
                        className="pb-4 md:hidden"
                    >
                        <div className="relative">

                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={
                                    handleSearchChange
                                }
                                placeholder="Search food, stationery..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm font-medium text-gray-900 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchTerm("")
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    <X size={16} />
                                </button>
                            )}

                        </div>
                    </form>

                </div>

                {/* MOBILE MENU */}
                {mobileMenuOpen && (
                    <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden dark:border-gray-800 dark:bg-gray-950">

                        <div className="space-y-2">

                            {/* LOCATION */}
                            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900">

                                <MapPin
                                    size={18}
                                    className="text-red-500"
                                />

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                        Deliver to
                                    </p>

                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        COER University
                                    </p>
                                </div>

                            </div>

                            {/* THEME */}
                            <button
                                type="button"
                                onClick={() =>
                                    setDarkMode(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                {darkMode ? (
                                    <Sun size={18} />
                                ) : (
                                    <Moon size={18} />
                                )}

                                {darkMode
                                    ? "Light Mode"
                                    : "Dark Mode"}
                            </button>

                            {/* MOBILE CART */}
                            <button
                                type="button"
                                onClick={
                                    handleCartClick
                                }
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                                <ShoppingCart
                                    size={18}
                                />

                                Cart

                                {cartCount > 0 && (
                                    <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* LOGIN */}
                            {!loggedInUser && (
                                <button
                                    type="button"
                                    onClick={
                                        openLogin
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl bg-red-500 px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-red-600"
                                >
                                    <User size={18} />
                                    Login
                                </button>
                            )}

                            {/* MY ORDERS */}
                            {(loggedInUser?.role ===
                                "customer" ||
                                loggedInUser?.role ===
                                "user") && (
                                    <button
                                        type="button"
                                        onClick={
                                            openOrders
                                        }
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        <ShoppingCart
                                            size={18}
                                        />
                                        My Orders
                                    </button>
                                )}

                            {/* ADMIN DASHBOARD */}
                            {loggedInUser?.role ===
                                "admin" && (
                                    <button
                                        type="button"
                                        onClick={
                                            openAdminDashboard
                                        }
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        <ShieldCheck
                                            size={18}
                                        />
                                        Admin Dashboard
                                    </button>
                                )}

                            {/* SHOP OWNER DASHBOARD */}
                            {loggedInUser?.role ===
                                "shop_owner" && (
                                    <button
                                        type="button"
                                        onClick={
                                            openShopOwnerDashboard
                                        }
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        <StoreIcon />
                                        Shop Owner Dashboard
                                    </button>
                                )}

                            {/* LOGOUT */}
                            {loggedInUser && (
                                <button
                                    type="button"
                                    onClick={
                                        handleLogout
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                >
                                    <LogOut
                                        size={
                                            18
                                        }
                                    />
                                    Logout
                                </button>
                            )}

                        </div>
                    </div>
                )}
            </nav>

            {/* CART DRAWER */}
            <CartDrawer
                isOpen={cartOpen}
                onClose={closeCart}
            />

            {/* ORDER TRACKING / MY ORDERS */}
            {ordersOpen && (
                <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-50 dark:bg-gray-950">

                    <button
                        type="button"
                        onClick={
                            closeOrders
                        }
                        className="fixed right-5 top-5 z-[120] flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-lg transition hover:bg-gray-100 hover:text-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-red-400"
                        aria-label="Close order tracking"
                    >
                        <X size={21} />
                    </button>

                    <OrderTracking />

                </div>
            )}
        </>
    );
}

/* =========================
   SHOP OWNER ICON
========================= */
function StoreIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 9l2-5h14l2 5" />
            <path d="M5 9v10h14V9" />
            <path d="M3 9h18" />
            <path d="M8 19v-6h8v6" />
        </svg>
    );
}

export default Navbar;