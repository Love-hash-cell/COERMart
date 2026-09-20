import {
    Apple,
    BookOpen,
    Coffee,
    FileText,
    Gift,
    Pizza,
    ShoppingBag,
    Utensils,
} from "lucide-react";

const categories = [
    {
        name: "Food",
        icon: Utensils,
        description: "Meals & combos",
    },
    {
        name: "Drinks",
        icon: Coffee,
        description: "Tea, coffee & more",
    },
    {
        name: "Snacks",
        icon: Apple,
        description: "Quick bites",
    },
    {
        name: "Fast Food",
        icon: Pizza,
        description: "Burgers & pizza",
    },
    {
        name: "Stationery",
        icon: BookOpen,
        description: "Study essentials",
    },
    {
        name: "Printing",
        icon: FileText,
        description: "Print & photocopy",
    },
    {
        name: "Essentials",
        icon: ShoppingBag,
        description: "Daily needs",
    },
    {
        name: "More",
        icon: Gift,
        description: "Explore more",
    },
];

function Categories() {
    return (
        <section className="bg-white py-12 dark:bg-gray-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="mb-1 text-sm font-semibold text-red-500">
                            EXPLORE COERMart
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                            What are you looking for?
                        </h2>
                    </div>

                    <button className="hidden text-sm font-semibold text-red-500 transition hover:text-red-600 sm:block">
                        View all →
                    </button>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">

                    {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <button
                                key={category.name}
                                className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center transition duration-300 hover:-translate-y-1 hover:border-red-100 hover:bg-red-50 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-red-500/20 dark:hover:bg-red-500/10"
                            >
                                {/* Icon */}
                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition duration-300 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-red-500/20 dark:bg-gray-800 dark:text-gray-300 dark:group-hover:bg-red-500">
                                    <Icon size={24} strokeWidth={1.8} />
                                </div>

                                {/* Name */}
                                <h3 className="text-sm font-bold text-gray-800 transition group-hover:text-red-500 dark:text-gray-200">
                                    {category.name}
                                </h3>

                                {/* Description */}
                                <p className="mt-1 hidden text-[11px] text-gray-500 sm:block dark:text-gray-400">
                                    {category.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default Categories;