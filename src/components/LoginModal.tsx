import { useState } from "react";
import { Lock, User, X } from "lucide-react";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (role: "student" | "admin") => void;
}

function LoginModal({
    isOpen,
    onClose,
    onLogin,
}: LoginModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleLogin = () => {
        setError("");

        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }

        /*
         * DEMO ADMIN LOGIN
         *
         * Email: admin@coermart.com
         * Password: admin123
         */
        if (
            email === "admin@coermart.com" &&
            password === "admin123"
        ) {
            localStorage.setItem(
                "coermart_user",
                JSON.stringify({
                    email,
                    role: "admin",
                })
            );

            onLogin("admin");
            return;
        }

        /*
         * Any other valid credentials are treated
         * as a student for the demo.
         */
        localStorage.setItem(
            "coermart_user",
            JSON.stringify({
                email,
                role: "student",
            })
        );

        onLogin("student");
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">

            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 sm:p-8">

                {/* CLOSE */}

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
                    aria-label="Close login"
                >
                    <X size={20} />
                </button>

                {/* HEADER */}

                <div className="text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-xl font-black text-white shadow-lg shadow-red-500/20">
                        C
                    </div>

                    <h2 className="mt-5 text-2xl font-black text-gray-900 dark:text-white">
                        Welcome to COERMart
                    </h2>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Login to continue shopping
                    </p>

                </div>

                {/* FORM */}

                <div className="mt-7 space-y-4">

                    {/* EMAIL */}

                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                            Email
                        </label>

                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-500/10 dark:border-gray-700 dark:bg-gray-950">

                            <User
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="Enter your email"
                                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                            />

                        </div>
                    </div>

                    {/* PASSWORD */}

                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                            Password
                        </label>

                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-500/10 dark:border-gray-700 dark:bg-gray-950">

                            <Lock
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                            />

                        </div>
                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* LOGIN */}

                    <button
                        type="button"
                        onClick={handleLogin}
                        className="w-full rounded-xl bg-red-500 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600"
                    >
                        Login
                    </button>

                </div>

                {/* DEMO INFO */}

                <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-950">

                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Admin Demo
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        admin@coermart.com / admin123
                    </p>

                </div>

            </div>
        </div>
    );
}

export default LoginModal;