import {
    Mail,
    MapPin,
    Phone,
} from "lucide-react";

function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">

            {/* Main Footer */}
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

                    {/* BRAND */}
                    <div>
                        <div className="flex items-center gap-2">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-xl font-black text-white shadow-sm">
                                C
                            </div>

                            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                COER<span className="text-red-500">Mart</span>
                            </h2>

                        </div>

                        <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Your campus marketplace for food, stationery and
                            everyday essentials — delivered right where you need them.
                        </p>

                        {/* SOCIAL LINKS */}
                        <div className="mt-6 flex items-center gap-3">

                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-xs font-bold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-gray-800 dark:text-gray-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
                            >
                                IG
                            </a>

                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-xs font-bold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-gray-800 dark:text-gray-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
                            >
                                IN
                            </a>

                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-xs font-bold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-gray-800 dark:text-gray-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
                            >
                                X
                            </a>

                        </div>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                            Quick Links
                        </h3>

                        <ul className="mt-5 space-y-3">
                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                                >
                                    Home
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                                >
                                    Food
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                                >
                                    Stationery
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                                >
                                    My Orders
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                                >
                                    Cart
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* CATEGORIES */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                            Categories
                        </h3>

                        <ul className="mt-5 space-y-3">
                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                                >
                                    Fast Food
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                                >
                                    Drinks
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                                >
                                    Snacks
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                                >
                                    Notebooks
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="text-sm text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                                >
                                    Study Essentials
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* CONTACT */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                            Contact Us
                        </h3>

                        <div className="mt-5 space-y-4">

                            {/* LOCATION */}
                            <div className="flex gap-3">
                                <MapPin
                                    size={18}
                                    className="mt-0.5 shrink-0 text-red-500"
                                />

                                <p className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                                    COER University
                                    <br />
                                    Roorkee, Uttarakhand
                                </p>
                            </div>

                            {/* PHONE */}
                            <div className="flex items-center gap-3">
                                <Phone
                                    size={17}
                                    className="shrink-0 text-red-500"
                                />

                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    +91 XXXXX XXXXX
                                </span>
                            </div>

                            {/* EMAIL */}
                            <div className="flex items-center gap-3">
                                <Mail
                                    size={17}
                                    className="shrink-0 text-red-500"
                                />

                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    support@coermart.com
                                </span>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="border-t border-gray-200 dark:border-gray-800">

                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:px-6 lg:px-8 sm:text-left">

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} COERMart. All rights reserved.
                    </p>

                    <div className="flex items-center gap-5">

                        <a
                            href="#"
                            className="text-xs text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                        >
                            Privacy Policy
                        </a>

                        <a
                            href="#"
                            className="text-xs text-gray-500 transition hover:text-red-500 dark:text-gray-400"
                        >
                            Terms & Conditions
                        </a>

                    </div>

                </div>
            </div>

        </footer>
    );
}

export default Footer;