import {
    ArrowLeft,
    Lock,
    Mail,
    Phone,
    ShieldCheck,
    User,
    X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { API_URL } from "../utils/config";

interface LoginProps {
    onClose: () => void;
    onAdminLogin: () => void;
    onShopOwnerLogin: () => void;
    onStudentLogin: () => void;
}

type LoginRole = "user" | "admin";
type AuthMode = "login" | "signup";

function Login({
    onClose,
    onAdminLogin,
    onShopOwnerLogin,
    onStudentLogin,
}: LoginProps) {
    const [role, setRole] =
        useState<LoginRole>("user");

    const [mode, setMode] =
        useState<AuthMode>("login");

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] =
        useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] =
        useState(false);

    /* ============================================================
       SAVE LOGIN DATA
       Each browser tab/device keeps its own login session.
    ============================================================ */

    const saveAuthData = (data: any) => {
        sessionStorage.setItem(
            "coermart_token",
            data.token
        );

        sessionStorage.setItem(
            "coermart_logged_in",
            "true"
        );

        sessionStorage.setItem(
            "coermart_user",
            JSON.stringify(data.user)
        );

        sessionStorage.setItem(
            "coermart_user_role",
            data.user.role
        );

        if (data.user.name) {
            sessionStorage.setItem(
                "coermart_user_name",
                data.user.name
            );
        }

        if (data.user.email) {
            sessionStorage.setItem(
                "coermart_user_email",
                data.user.email
            );
        }

        window.dispatchEvent(
            new Event("auth-changed")
        );
    };

    /* ============================================================
       ROLE BASED REDIRECT
    ============================================================ */

    const redirectUser = (user: any) => {
        if (user.role === "admin") {
            onAdminLogin();
        } else if (
            user.role === "shop_owner"
        ) {
            onShopOwnerLogin();
        } else {
            onStudentLogin();
        }
    };

    /* ============================================================
       LOGIN
    ============================================================ */

    const handleLogin = async (
        e: FormEvent
    ) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            if (!email.trim()) {
                setError(
                    "Please enter your email."
                );
                setLoading(false);
                return;
            }

            if (!password.trim()) {
                setError(
                    "Please enter your password."
                );
                setLoading(false);
                return;
            }

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Invalid email or password."
                );
                setLoading(false);
                return;
            }

            saveAuthData(data);

            redirectUser(data.user);
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setError(
                "Unable to connect to COERMart server. Please make sure the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ============================================================
       SIGN UP
    ============================================================ */

    const handleSignup = async (
        e: FormEvent
    ) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            /* BASIC VALIDATION */

            if (!name.trim()) {
                setError(
                    "Please enter your full name."
                );
                setLoading(false);
                return;
            }

            if (!email.trim()) {
                setError(
                    "Please enter your email."
                );
                setLoading(false);
                return;
            }

            if (!phone.trim()) {
                setError(
                    "Please enter your phone number."
                );
                setLoading(false);
                return;
            }

            if (phone.trim().length < 10) {
                setError(
                    "Please enter a valid phone number."
                );
                setLoading(false);
                return;
            }

            if (!password.trim()) {
                setError(
                    "Please enter a password."
                );
                setLoading(false);
                return;
            }

            if (password.length < 6) {
                setError(
                    "Password must be at least 6 characters."
                );
                setLoading(false);
                return;
            }

            if (
                password !== confirmPassword
            ) {
                setError(
                    "Passwords do not match."
                );
                setLoading(false);
                return;
            }

            /* ====================================================
               REGISTER USER
            ==================================================== */

            const registerResponse =
                await fetch(
                    `${API_URL}/api/auth/register`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            name: name.trim(),
                            email: email.trim(),
                            phone: phone.trim(),
                            password,
                        }),
                    }
                );

            const registerData =
                await registerResponse.json();

            if (!registerResponse.ok) {
                setError(
                    registerData.message ||
                    "Unable to create account."
                );
                setLoading(false);
                return;
            }

            /* ====================================================
               AUTOMATICALLY LOGIN AFTER SIGNUP
            ==================================================== */

            const loginResponse =
                await fetch(
                    `${API_URL}/api/auth/login`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            email:
                                email.trim(),
                            password,
                        }),
                    }
                );

            const loginData =
                await loginResponse.json();

            if (!loginResponse.ok) {
                /*
                 * Account was created successfully,
                 * so move the user back to login.
                 */

                setMode("login");
                setPassword("");
                setConfirmPassword("");

                setError(
                    "Account created successfully. Please login with your new account."
                );

                setLoading(false);
                return;
            }

            /* SAVE LOGIN */

            saveAuthData(loginData);

            /* OPEN COERMART */

            redirectUser(loginData.user);
        } catch (error) {
            console.error(
                "Signup error:",
                error
            );

            setError(
                "Unable to connect to COERMart server. Please make sure the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ============================================================
       SWITCH LOGIN / SIGNUP
    ============================================================ */

    const switchMode = (
        newMode: AuthMode
    ) => {
        setMode(newMode);
        setError("");

        if (newMode === "login") {
            setConfirmPassword("");
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

            <div className="relative max-h-[95vh] w-full max-w-md overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">

                {/* CLOSE */}

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
                >
                    <X size={20} />
                </button>

                {/* HEADER */}

                <div className="px-6 pb-5 pt-7 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20">

                        {role === "admin" ? (
                            <ShieldCheck
                                size={27}
                            />
                        ) : (
                            <User size={27} />
                        )}

                    </div>

                    <h1 className="mt-5 text-2xl font-black text-gray-900 dark:text-white">
                        Welcome to COER
                        <span className="text-red-500">
                            Mart
                        </span>
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {mode === "login"
                            ? "Login to continue"
                            : "Create your COERMart account"}
                    </p>

                </div>

                {/* LOGIN / SIGNUP TABS */}

                {role === "user" && (
                    <div className="mx-6 flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">

                        <button
                            type="button"
                            onClick={() =>
                                switchMode(
                                    "login"
                                )
                            }
                            className={`flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold transition ${mode === "login"
                                ? "bg-white text-red-500 shadow-sm dark:bg-gray-700 dark:text-red-400"
                                : "text-gray-500 dark:text-gray-400"
                                }`}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                switchMode(
                                    "signup"
                                )
                            }
                            className={`flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold transition ${mode === "signup"
                                ? "bg-white text-red-500 shadow-sm dark:bg-gray-700 dark:text-red-400"
                                : "text-gray-500 dark:text-gray-400"
                                }`}
                        >
                            Sign Up
                        </button>

                    </div>
                )}

                {/* ROLE SELECTOR */}

                {mode === "login" && (
                    <div className="mx-6 mt-4 flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">

                        <button
                            type="button"
                            onClick={() => {
                                setRole("user");
                                setError("");
                            }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${role === "user"
                                ? "bg-white text-red-500 shadow-sm dark:bg-gray-700 dark:text-red-400"
                                : "text-gray-500 dark:text-gray-400"
                                }`}
                        >
                            <User size={17} />
                            User
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setRole("admin");
                                setMode("login");
                                setError("");
                            }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${role === "admin"
                                ? "bg-white text-red-500 shadow-sm dark:bg-gray-700 dark:text-red-400"
                                : "text-gray-500 dark:text-gray-400"
                                }`}
                        >
                            <ShieldCheck
                                size={17}
                            />
                            Admin
                        </button>

                    </div>
                )}

                {/* FORM */}

                <form
                    onSubmit={
                        mode === "login"
                            ? handleLogin
                            : handleSignup
                    }
                    className="space-y-4 px-6 pb-7 pt-5"
                >

                    {/* FULL NAME */}

                    {mode === "signup" && (
                        <div>

                            <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                                Full Name
                            </label>

                            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-950">

                                <User
                                    size={18}
                                    className="text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your full name"
                                    className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-white"
                                />

                            </div>

                        </div>
                    )}

                    {/* PHONE */}

                    {mode === "signup" && (
                        <div>

                            <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                                Phone Number
                            </label>

                            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-950">

                                <Phone
                                    size={18}
                                    className="text-gray-400"
                                />

                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your phone number"
                                    className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-white"
                                />

                            </div>

                        </div>
                    )}

                    {/* EMAIL */}

                    <div>

                        <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                            Email Address
                        </label>

                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-950">

                            <Mail
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                placeholder={
                                    role === "admin"
                                        ? "admin@coermart.com"
                                        : "you@example.com"
                                }
                                className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-white"
                            />

                        </div>

                    </div>

                    {/* PASSWORD */}

                    <div>

                        <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                            Password
                        </label>

                        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-950">

                            <Lock
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                placeholder={
                                    mode === "signup"
                                        ? "Minimum 6 characters"
                                        : "Enter password"
                                }
                                className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-white"
                            />

                        </div>

                    </div>

                    {/* CONFIRM PASSWORD */}

                    {mode === "signup" && (
                        <div>

                            <label className="mb-2 block text-xs font-bold text-gray-600 dark:text-gray-300">
                                Confirm Password
                            </label>

                            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-950">

                                <Lock
                                    size={18}
                                    className="text-gray-400"
                                />

                                <input
                                    type="password"
                                    value={
                                        confirmPassword
                                    }
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Re-enter your password"
                                    className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-white"
                                />

                            </div>

                        </div>
                    )}

                    {/* ADMIN DEMO CREDENTIALS */}

                    {role === "admin" &&
                        mode === "login" && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">

                                <p className="font-bold">
                                    Demo Admin Login
                                </p>

                                <p className="mt-1">
                                    Email:{" "}
                                    admin@coermart.com
                                </p>

                                <p>
                                    Password:
                                    {" "}
                                    admin123
                                </p>

                            </div>
                        )}

                    {/* SHOP OWNER INFO */}

                    {role === "user" &&
                        mode === "login" && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">

                                <p className="font-semibold">
                                    Shop owners can also
                                    login here.
                                </p>

                                <p className="mt-1">
                                    COERMart will
                                    automatically detect
                                    your account type.
                                </p>

                            </div>
                        )}

                    {/* SIGNUP INFO */}

                    {mode === "signup" && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">

                            <p className="font-semibold">
                                Create your free
                                COERMart account.
                            </p>

                            <p className="mt-1">
                                Your account will be
                                created as a Student
                                account.
                            </p>

                        </div>
                    )}

                    {/* ERROR */}

                    {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* SUBMIT BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 text-sm font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {loading ? (
                            mode === "signup"
                                ? "Creating Account..."
                                : "Logging in..."
                        ) : mode === "signup" ? (
                            <>
                                <User size={18} />
                                Create Account
                            </>
                        ) : role === "admin" ? (
                            <>
                                <ShieldCheck
                                    size={18}
                                />
                                Login as Admin
                            </>
                        ) : (
                            <>
                                <User size={18} />
                                Login
                            </>
                        )}

                    </button>

                    {/* SWITCH LOGIN/SIGNUP */}

                    {role === "user" && (
                        <div className="text-center text-xs text-gray-500 dark:text-gray-400">

                            {mode === "login" ? (
                                <>
                                    New to COERMart?{" "}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            switchMode(
                                                "signup"
                                            )
                                        }
                                        className="font-bold text-red-500 hover:text-red-600"
                                    >
                                        Create an account
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an
                                    account?{" "}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            switchMode(
                                                "login"
                                            )
                                        }
                                        className="font-bold text-red-500 hover:text-red-600"
                                    >
                                        Login
                                    </button>
                                </>
                            )}

                        </div>
                    )}

                    {/* BACK */}

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center justify-center gap-2 py-2 text-xs font-bold text-gray-500 hover:text-red-500"
                    >
                        <ArrowLeft size={15} />
                        Back to Store
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Login;