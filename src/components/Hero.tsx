import {
    ArrowRight,
    BookOpen,
    Search,
    ShoppingBag,
    Sparkles,
} from "lucide-react";

interface HeroProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}

function Hero({ searchTerm, setSearchTerm }: HeroProps) {

    /* =========================
       SEARCH
    ========================= */
    const handleSearch = () => {
        const resultsSection =
            document.getElementById("popular-food");

        if (resultsSection) {
            resultsSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    /* =========================
       ORDER FOOD
    ========================= */
    const handleOrderFood = () => {
        const foodSection =
            document.getElementById("popular-food");

        if (foodSection) {
            foodSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    /* =========================
       SHOP STATIONERY
    ========================= */
    const handleShopStationery = () => {
        const stationerySection =
            document.getElementById("stationery");

        if (stationerySection) {
            stationerySection.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-red-50 via-white to-white dark:from-red-950/20 dark:via-gray-950 dark:to-gray-950">

            {/* Decorative Background */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-200/40 blur-3xl dark:bg-red-500/10" />

            <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl dark:bg-orange-500/10" />

            <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">

                {/* Top Badge */}
                <div className="mb-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm dark:border-red-500/20 dark:bg-gray-900 dark:text-red-400">
                        <Sparkles size={16} />
                        Your campus, your marketplace
                    </div>
                </div>

                {/* Heading */}
                <div className="mx-auto max-w-4xl text-center">

                    <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
                        Everything you need,
                        <span className="block text-red-500">
                            right on campus.
                        </span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg dark:text-gray-400">
                        Order delicious food, snacks, beverages and stationery
                        from your favorite campus stores — delivered right to you.
                    </p>

                </div>

                {/* Search */}
                <div className="mx-auto mt-8 max-w-2xl">
                    <div className="flex h-14 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 shadow-lg shadow-gray-200/50 transition focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-500/10 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/20">

                        <Search
                            size={21}
                            className="shrink-0 text-gray-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            placeholder="Search for food, stationery & more..."
                            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 sm:text-base dark:text-gray-200"
                        />

                        <button
                            type="button"
                            onClick={handleSearch}
                            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
                        >
                            Search
                        </button>

                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

                    {/* ORDER FOOD */}
                    <button
                        type="button"
                        onClick={handleOrderFood}
                        className="group flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-bold text-white shadow-md shadow-red-500/20 transition hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-lg"
                    >
                        <ShoppingBag size={19} />

                        Order Food

                        <ArrowRight
                            size={17}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    </button>

                    {/* SHOP STATIONERY */}
                    <button
                        type="button"
                        onClick={handleShopStationery}
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-bold text-gray-800 transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                        <BookOpen size={19} />

                        Shop Stationery
                    </button>

                </div>

                {/* Trust Info */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500 dark:text-gray-400">

                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Campus delivery
                    </div>

                    <div className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-700" />

                    <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            Fast
                        </span>{" "}
                        delivery
                    </div>

                    <div className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-gray-700" />

                    <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            Multiple
                        </span>{" "}
                        campus stores
                    </div>

                </div>

            </div>
        </section>
    );
}

export default Hero;