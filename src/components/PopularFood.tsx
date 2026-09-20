
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ArrowLeft, Store } from "lucide-react";
import { API_URL } from "../utils/config";
import ProductCard from "./ProductCard";
import type { Product } from "./ProductCard";
import { foods } from "../data/foods";

interface PopularFoodProps {
    searchTerm: string;
}

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

function PopularFood({ searchTerm }: PopularFoodProps) {
    const [mongoProducts, setMongoProducts] = useState<ApiProduct[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

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

                // Show all food shops from MongoDB,
                // even if they currently have no products.
                const foodShops = shopsData.filter(
                    (shop) => shop.type === "food"
                );

                setMongoProducts(productsData);
                setShops(foodShops);
            } catch (error) {
                console.error("Error loading food data:", error);
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
                "Customer product socket connected:",
                socket.id
            );
        });

        // Refresh when a shop owner adds a product
        socket.on("product-created", () => {
            console.log(
                "New product created. Refreshing products..."
            );

            fetchData();
        });

        // Refresh when a shop owner deletes a product
        socket.on("product-deleted", () => {
            console.log(
                "Product deleted. Refreshing products..."
            );

            fetchData();
        });

        socket.on("connect_error", (error) => {
            console.error(
                "Customer product socket error:",
                error
            );
        });

        // Cleanup socket when component unmounts
        return () => {
            socket.disconnect();
        };
    }, []);

    const search = searchTerm.toLowerCase().trim();

    /*
     * Show ALL food shops.
     *
     * Previously, a shop was shown only when it had
     * at least one available food product.
     *
     * Now newly created shops also appear immediately.
     */
    const filteredShops = shops.filter((shop) => {
        if (!search) {
            return true;
        }

        const shopMatches = shop.name
            .toLowerCase()
            .includes(search);

        const productMatches = mongoProducts.some(
            (product) =>
                product.type === "food" &&
                product.shopId === shop._id &&
                product.available !== false &&
                product.name.toLowerCase().includes(search)
        );

        return shopMatches || productMatches;
    });

    /*
     * Get products belonging ONLY to selected shop.
     */
    const selectedShopProducts: Product[] = selectedShop
        ? mongoProducts
            .filter(
                (product) =>
                    product.type === "food" &&
                    product.shopId === selectedShop._id &&
                    product.available !== false
            )
            .filter((product) => {
                if (!search) {
                    return true;
                }

                return (
                    product.name
                        .toLowerCase()
                        .includes(search) ||
                    product.category
                        ?.toLowerCase()
                        .includes(search)
                );
            })
            .map((product) => ({
                /*
                 * Preserve MongoDB product ID for
                 * checkout/order creation.
                 */
                productId: product._id,

                name: product.name,
                store: selectedShop.name,
                price: product.price,
                rating: 4.5,
                time: "15-20 min",
                image:
                    product.image ||
                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
                tag: product.category || undefined,
            }))
        : [];

    /*
     * Keep old static foods as fallback
     * if MongoDB has no food products.
     */
    const hasMongoFoodProducts = mongoProducts.some(
        (product) =>
            product.type === "food" &&
            product.available !== false
    );

    const fallbackFoods: Product[] = foods.filter((food) => {
        if (!search) {
            return true;
        }

        return (
            food.name.toLowerCase().includes(search) ||
            food.store.toLowerCase().includes(search)
        );
    });

    const openShopMenu = (shop: Shop) => {
        setSelectedShop(shop);
    };

    const backToShops = () => {
        setSelectedShop(null);
    };

    return (
        <section
            id="popular-food"
            className="bg-gray-50 py-14 dark:bg-gray-900/50"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="mb-1 text-sm font-bold uppercase tracking-wide text-red-500">
                            Hungry?
                        </p>

                        <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                            {selectedShop
                                ? `${selectedShop.name} Menu`
                                : searchTerm
                                    ? "Food Search"
                                    : "Food Shops"}
                        </h2>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {selectedShop
                                ? `Explore food available at ${selectedShop.name}.`
                                : searchTerm
                                    ? `Showing food shops and items for "${searchTerm}"`
                                    : "Choose a campus food shop to view its menu."}
                        </p>
                    </div>

                    {!selectedShop && !searchTerm && (
                        <button className="hidden rounded-lg px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 sm:block dark:hover:bg-red-500/10">
                            View all →
                        </button>
                    )}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-[250px] items-center justify-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Loading food shops...
                        </p>
                    </div>
                ) : selectedShop ? (
                    /* ================= SHOP MENU ================= */
                    <div>
                        {/* Back to Shops */}
                        <button
                            onClick={backToShops}
                            className="mb-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft size={17} />
                            Back to Food Shops
                        </button>

                        {/* Products */}
                        {selectedShopProducts.length > 0 ? (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {selectedShopProducts.map(
                                    (food, index) => (
                                        <ProductCard
                                            key={`${food.productId}-${food.name}-${index}`}
                                            product={food}
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 text-center dark:border-gray-700 dark:bg-gray-900">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl dark:bg-red-500/10">
                                    🔍
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    No food items found
                                </h3>

                                <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
                                    No food items match "{searchTerm}" in{" "}
                                    {selectedShop.name}.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ================= FOOD SHOPS ================= */
                    <div>
                        {hasMongoFoodProducts ? (
                            filteredShops.length > 0 ? (
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {filteredShops.map((shop) => {
                                        const shopProductCount =
                                            mongoProducts.filter(
                                                (product) =>
                                                    product.type === "food" &&
                                                    product.shopId === shop._id &&
                                                    product.available !== false
                                            ).length;

                                        return (
                                            <button
                                                key={shop._id}
                                                onClick={() =>
                                                    openShopMenu(shop)
                                                }
                                                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                                            >
                                                {/* Shop Icon */}
                                                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10">
                                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-red-500 shadow-md transition duration-300 group-hover:scale-110 dark:bg-gray-800">
                                                        <Store size={38} />
                                                    </div>
                                                </div>

                                                {/* Shop Information */}
                                                <div className="p-4">
                                                    <h3 className="truncate text-lg font-black text-gray-900 dark:text-white">
                                                        {shop.name}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                        {shopProductCount}{" "}
                                                        {shopProductCount === 1
                                                            ? "food item"
                                                            : "food items"}
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
                                /* No Shop Search Result */
                                <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 text-center dark:border-gray-700 dark:bg-gray-900">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl dark:bg-red-500/10">
                                        🔍
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        No food shop found
                                    </h3>

                                    <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
                                        We couldn't find any food shop or food
                                        item matching "{searchTerm}".
                                    </p>
                                </div>
                            )
                        ) : (
                            /* ================= STATIC FALLBACK ================= */
                            fallbackFoods.length > 0 ? (
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {fallbackFoods.map((food, index) => (
                                        <ProductCard
                                            key={`${food.name}-${food.store}-${index}`}
                                            product={food}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 text-center dark:border-gray-700 dark:bg-gray-900">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl dark:bg-red-500/10">
                                        🔍
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        No food found
                                    </h3>

                                    <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
                                        We couldn't find any food matching "
                                        {searchTerm}".
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Mobile View All */}
                {!selectedShop && !searchTerm && (
                    <button className="mt-6 w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-red-500 transition hover:bg-red-50 sm:hidden dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-red-500/10">
                        View all food shops →
                    </button>
                )}
            </div>
        </section>
    );
}

export default PopularFood;