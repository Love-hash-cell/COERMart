import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import PopularFood from "./components/PopularFood";
import Offers from "./components/Offers";
import Stationery from "./components/Stationery";
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard";
import ShopOwnerDashboard from "./components/ShopOwnerDashboard";
import Login from "./components/Login";

import { CartProvider } from "./context/CartContext";
import { OrdersProvider } from "./context/OrdersContext";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  // Check whether user is already logged in
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return (
      sessionStorage.getItem("coermart_logged_in") === "true" &&
      !!sessionStorage.getItem("coermart_token") &&
      !!sessionStorage.getItem("coermart_user_role")
    );
  });

  const [showAdmin, setShowAdmin] = useState(() => {
    return (
      sessionStorage.getItem("coermart_logged_in") === "true" &&
      sessionStorage.getItem("coermart_user_role") === "admin"
    );
  });

  const [showShopOwner, setShowShopOwner] = useState(() => {
    return (
      sessionStorage.getItem("coermart_logged_in") === "true" &&
      sessionStorage.getItem("coermart_user_role") === "shop_owner"
    );
  });

  // Used when opening login from the Navbar
  const [showLogin, setShowLogin] = useState(() => {
    return !(
      sessionStorage.getItem("coermart_logged_in") === "true" &&
      !!sessionStorage.getItem("coermart_token") &&
      !!sessionStorage.getItem("coermart_user_role")
    );
  });

  useEffect(() => {
    const handleOpenLogin = () => {
      setShowLogin(true);
    };

    const handleOpenAdminDashboard = () => {
      const role =
        sessionStorage.getItem(
          "coermart_user_role"
        );

      if (role === "admin") {
        setIsLoggedIn(true);
        setShowAdmin(true);
        setShowShopOwner(false);
        setShowLogin(false);
      }
    };

    const handleOpenShopOwnerDashboard = () => {
      const role =
        sessionStorage.getItem(
          "coermart_user_role"
        );

      if (role === "shop_owner") {
        setIsLoggedIn(true);
        setShowShopOwner(true);
        setShowAdmin(false);
        setShowLogin(false);
      }
    };

    const handleAuthChanged = () => {
      const loggedIn =
        sessionStorage.getItem(
          "coermart_logged_in"
        ) === "true";

      const role =
        sessionStorage.getItem(
          "coermart_user_role"
        );

      const token =
        sessionStorage.getItem(
          "coermart_token"
        );

      setIsLoggedIn(
        loggedIn &&
        !!token &&
        !!role
      );

      if (!loggedIn || !token || !role) {
        setShowAdmin(false);
        setShowShopOwner(false);
        setShowLogin(true);
      }
    };

    window.addEventListener(
      "open-login",
      handleOpenLogin
    );

    window.addEventListener(
      "open-admin-dashboard",
      handleOpenAdminDashboard
    );

    window.addEventListener(
      "open-shop-owner-dashboard",
      handleOpenShopOwnerDashboard
    );

    window.addEventListener(
      "auth-changed",
      handleAuthChanged
    );

    return () => {
      window.removeEventListener(
        "open-login",
        handleOpenLogin
      );

      window.removeEventListener(
        "open-admin-dashboard",
        handleOpenAdminDashboard
      );

      window.removeEventListener(
        "open-shop-owner-dashboard",
        handleOpenShopOwnerDashboard
      );

      window.removeEventListener(
        "auth-changed",
        handleAuthChanged
      );
    };
  }, []);

  // ADMIN LOGIN
  const handleAdminLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    setShowAdmin(true);
    setShowShopOwner(false);
  };

  // SHOP OWNER LOGIN
  const handleShopOwnerLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    setShowShopOwner(true);
    setShowAdmin(false);
  };

  // CUSTOMER LOGIN
  const handleStudentLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    setShowAdmin(false);
    setShowShopOwner(false);
  };

  // LOGOUT
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

    setIsLoggedIn(false);
    setShowAdmin(false);
    setShowShopOwner(false);

    // IMPORTANT:
    // After logout, show Login page again
    setShowLogin(true);

    window.dispatchEvent(
      new Event("auth-changed")
    );
  };

  /* =========================================
     LOGIN PAGE
     ========================================= */

  if (!isLoggedIn) {
    return (
      <OrdersProvider>
        <CartProvider>
          <Login
            onClose={() => {
              // Do nothing.
              // User must login before entering COERMart.
            }}
            onAdminLogin={handleAdminLogin}
            onShopOwnerLogin={handleShopOwnerLogin}
            onStudentLogin={handleStudentLogin}
          />
        </CartProvider>
      </OrdersProvider>
    );
  }

  /* =========================================
     ADMIN PANEL
     ========================================= */

  if (showAdmin) {
    return (
      <OrdersProvider>
        <CartProvider>
          <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">

            {/* ADMIN HEADER */}
            <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto flex max-w-7xl items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-red-500">
                    COERMart
                  </p>

                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    Admin Panel
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                  >
                    Logout
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdmin(false);
                    }}
                    className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Back to Store
                  </button>

                </div>
              </div>
            </div>

            <AdminDashboard
              onBack={() => {
                setShowAdmin(false);
              }}
            />
          </div>
        </CartProvider>
      </OrdersProvider>
    );
  }

  /* =========================================
     SHOP OWNER PANEL
     ========================================= */

  if (showShopOwner) {
    return (
      <OrdersProvider>
        <CartProvider>
          <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">

            {/* SHOP OWNER HEADER */}
            <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto flex max-w-7xl items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-red-500">
                    COERMart
                  </p>

                  <p className="text-sm font-black text-gray-900 dark:text-white">
                    Shop Owner Panel
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                  >
                    Logout
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowShopOwner(false);
                    }}
                    className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Back to Store
                  </button>

                </div>
              </div>
            </div>

            <ShopOwnerDashboard />
          </div>
        </CartProvider>
      </OrdersProvider>
    );
  }

  /* =========================================
     MAIN COERMART STORE
     ========================================= */

  return (
    <OrdersProvider>
      <CartProvider>

        <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">

          <Navbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <Hero
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <Categories />

          <PopularFood
            searchTerm={searchTerm}
          />

          <Offers />

          <Stationery />

          <Footer />

        </div>

        {/* LOGIN MODAL FOR ALREADY LOGGED-IN USERS */}
        {showLogin && (
          <Login
            onClose={() => {
              setShowLogin(false);
            }}
            onAdminLogin={handleAdminLogin}
            onShopOwnerLogin={handleShopOwnerLogin}
            onStudentLogin={handleStudentLogin}
          />
        )}

      </CartProvider>
    </OrdersProvider>
  );
}

export default App;