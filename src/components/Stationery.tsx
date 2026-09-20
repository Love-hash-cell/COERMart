
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ArrowLeft, Store } from "lucide-react";
import { API_URL } from "../utils/config";
import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";

interface ApiProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  type: "food" | "stationery";
  shopId: string;
  available: boolean;
}

interface ApiShop {
  _id: string;
  name: string;
  type: "food" | "stationery";
  ownerId?: string | null;
}

interface Shop {
  _id: string;
  name: string;
  type: "food" | "stationery";
}

function Stationery() {
  const [mongoProducts, setMongoProducts] = useState<ApiProduct[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  // =====================================================
  // FETCH PRODUCTS + SHOPS + REAL-TIME UPDATES
  // =====================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, shopsResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/products`),
            fetch(`${API_URL}/api/shops`),
          ]);

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        if (!shopsResponse.ok) {
          throw new Error("Failed to fetch shops");
        }

        const productsData: ApiProduct[] =
          await productsResponse.json();

        const shopsData: ApiShop[] =
          await shopsResponse.json();

        // Only stationery shops
        const stationeryShops = shopsData.filter(
          (shop) => shop.type === "stationery"
        );

        setMongoProducts(productsData);
        setShops(stationeryShops);
      } catch (error) {
        console.error(
          "Error loading stationery data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    // Initial data loading
    fetchData();

    // Connect to Socket.IO
    const socket = io(API_URL);

    socket.on("connect", () => {
      console.log(
        "Customer stationery socket connected:",
        socket.id
      );
    });

    // Refresh when a shop owner adds a product
    socket.on("product-created", () => {
      console.log(
        "New product created. Refreshing stationery products..."
      );

      fetchData();
    });

    // Refresh when a shop owner deletes a product
    socket.on("product-deleted", () => {
      console.log(
        "Product deleted. Refreshing stationery products..."
      );

      fetchData();
    });

    socket.on("connect_error", (error) => {
      console.error(
        "Customer stationery socket error:",
        error
      );
    });

    // Cleanup socket when component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  // =====================================================
  // SHOW ALL STATIONERY SHOPS
  // INCLUDING SHOPS WITH 0 PRODUCTS
  // =====================================================

  const stationeryShops = shops.filter((shop) => {
    return shop.type === "stationery";
  });

  // =====================================================
  // PRODUCTS OF SELECTED SHOP
  // =====================================================

  const selectedShopProducts: Product[] = selectedShop
    ? mongoProducts
      .filter(
        (product) =>
          product.type === "stationery" &&
          product.shopId === selectedShop._id &&
          product.available !== false
      )
      .map((product) => ({
        // IMPORTANT:
        // MongoDB ID is required for checkout/orders
        productId: product._id,

        name: product.name,

        store: selectedShop.name,

        price: product.price,

        rating: 4.5,

        time: "10-15 min",

        image:
          product.image ||
          "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80",

        tag: product.category || undefined,
      }))
    : [];

  // =====================================================
  // OPEN SHOP MENU
  // =====================================================

  const openShopMenu = (shop: Shop) => {
    setSelectedShop(shop);
  };

  // =====================================================
  // BACK TO SHOPS
  // =====================================================

  const backToShops = () => {
    setSelectedShop(null);
  };

  return (
    <section
      id="stationery"
      className="bg-white py-14 dark:bg-gray-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-red-500">
              Study essentials
            </p>

            <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              {selectedShop
                ? `${selectedShop.name} Menu`
                : "Stationery Shops"}
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {selectedShop
                ? `Explore stationery available at ${selectedShop.name}.`
                : "Choose a stationery shop to view its products."}
            </p>
          </div>

          {!selectedShop && (
            <button
              type="button"
              className="hidden rounded-lg px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 sm:block dark:hover:bg-red-500/10"
            >
              View all →
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Loading stationery shops...
            </p>
          </div>
        ) : selectedShop ? (
          /* ================= SHOP MENU ================= */
          <div>
            {/* Back Button */}
            <button
              type="button"
              onClick={backToShops}
              className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={17} />

              Back to Stationery Shops
            </button>

            {/* Shop Products */}
            {selectedShopProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {selectedShopProducts.map((item, index) => (
                  <ProductCard
                    key={`${item.productId || item.name}-${item.store}-${index}`}
                    product={item}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl dark:bg-red-500/10">
                  📚
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  No stationery items found
                </h3>

                <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
                  This shop currently has no available
                  stationery items.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ================= STATIONERY SHOPS ================= */
          <div>
            {stationeryShops.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stationeryShops.map((shop) => {
                  const shopProductCount =
                    mongoProducts.filter(
                      (product) =>
                        product.type === "stationery" &&
                        product.shopId === shop._id &&
                        product.available !== false
                    ).length;

                  return (
                    <button
                      type="button"
                      key={shop._id}
                      onClick={() => openShopMenu(shop)}
                      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                    >
                      {/* Shop Icon */}
                      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-red-500 shadow-md transition duration-300 group-hover:scale-110 dark:bg-gray-800">
                          <Store size={38} />
                        </div>
                      </div>

                      {/* Shop Details */}
                      <div className="p-4">
                        <h3 className="truncate text-lg font-black text-gray-900 dark:text-white">
                          {shop.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {shopProductCount}{" "}
                          {shopProductCount === 1
                            ? "stationery item"
                            : "stationery items"}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-green-600">
                            ● Open
                          </span>

                          <span className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white transition group-hover:bg-red-600">
                            View Menu →
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* No Stationery Shop */
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 text-center dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl dark:bg-red-500/10">
                  📚
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  No stationery shop found
                </h3>

                <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
                  No stationery shops are currently available.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Mobile View All */}
        {!selectedShop && (
          <button
            type="button"
            className="mt-6 w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50 sm:hidden dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-red-500/10"
          >
            View all stationery shops →
          </button>
        )}
      </div>
    </section>
  );
}

export default Stationery;