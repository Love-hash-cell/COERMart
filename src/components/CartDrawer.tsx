import {
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
    X,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import Checkout from "./Checkout";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const {
        cartItems,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        cartTotal,
    } = useCart();

    const [checkoutOpen, setCheckoutOpen] = useState(false);

    if (!isOpen) {
        return null;
    }

    if (checkoutOpen) {
        return (
            <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-50 dark:bg-gray-950">
                <Checkout
                    onBack={() => setCheckoutOpen(false)}
                    onOrderPlaced={() => {
                        setCheckoutOpen(false);
                        onClose();
                    }}
                />
            </div>
        );
    }

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-950">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-5 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10">
                            <ShoppingBag size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white">
                                Your Cart
                            </h2>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {cartItems.length === 0
                                    ? "Your cart is empty"
                                    : `${cartItems.length} item${cartItems.length > 1
                                        ? "s"
                                        : ""
                                    }`}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
                        aria-label="Close cart"
                    >
                        <X size={21} />
                    </button>
                </div>

                {/* Cart Content */}
                <div className="flex-1 overflow-y-auto px-5 py-5">

                    {cartItems.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">

                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
                                <ShoppingBag size={34} />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
                                Your cart is empty
                            </h3>

                            <p className="mt-2 max-w-xs text-sm text-gray-500 dark:text-gray-400">
                                Add some delicious food or stationery
                                items to get started.
                            </p>

                            <button
                                onClick={onClose}
                                className="mt-6 rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-600"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">

                            {cartItems.map((item) => (
                                <div
                                    key={item.name}
                                    className="rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <div className="flex gap-3">

                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-20 w-20 shrink-0 rounded-xl object-cover"
                                        />

                                        <div className="min-w-0 flex-1">

                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                                        {item.name}
                                                    </h3>

                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        {item.store}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.name
                                                        )
                                                    }
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                                                    aria-label={`Remove ${item.name}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">

                                                <span className="text-sm font-black text-gray-900 dark:text-white">
                                                    ₹
                                                    {item.price *
                                                        item.quantity}
                                                </span>

                                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-950">

                                                    <button
                                                        onClick={() =>
                                                            decreaseQuantity(
                                                                item.name
                                                            )
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 hover:text-red-500 dark:text-gray-300 dark:hover:bg-gray-800"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus size={14} />
                                                    </button>

                                                    <span className="min-w-5 text-center text-xs font-bold text-gray-900 dark:text-white">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            increaseQuantity(
                                                                item.name
                                                            )
                                                        }
                                                        className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500 text-white transition hover:bg-red-600"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus size={14} />
                                                    </button>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-gray-950">

                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total
                            </span>

                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                ₹{cartTotal}
                            </span>
                        </div>

                        <button
                            onClick={() => setCheckoutOpen(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:bg-red-600 hover:shadow-lg"
                        >
                            Proceed to Checkout
                        </button>

                        <p className="mt-3 text-center text-xs text-gray-400">
                            Campus delivery available
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default CartDrawer;