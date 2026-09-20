import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";
import type { Product } from "../components/ProductCard";

interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productName: string) => void;
    increaseQuantity: (productName: string) => void;
    decreaseQuantity: (productName: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // ADD PRODUCT
    const addToCart = (product: Product) => {
        setCartItems((currentItems) => {
            const existingItem = currentItems.find(
                (item) => item.name === product.name
            );

            if (existingItem) {
                return currentItems.map((item) =>
                    item.name === product.name
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                        }
                        : item
                );
            }

            return [
                ...currentItems,
                {
                    ...product,
                    quantity: 1,
                },
            ];
        });
    };

    // REMOVE PRODUCT COMPLETELY
    const removeFromCart = (productName: string) => {
        setCartItems((currentItems) =>
            currentItems.filter((item) => item.name !== productName)
        );
    };

    // INCREASE QUANTITY
    const increaseQuantity = (productName: string) => {
        setCartItems((currentItems) =>
            currentItems.map((item) =>
                item.name === productName
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                    }
                    : item
            )
        );
    };

    // DECREASE QUANTITY
    const decreaseQuantity = (productName: string) => {
        setCartItems((currentItems) =>
            currentItems
                .map((item) =>
                    item.name === productName
                        ? {
                            ...item,
                            quantity: item.quantity - 1,
                        }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // CLEAR ENTIRE CART
    const clearCart = () => {
        setCartItems([]);
    };

    // TOTAL ITEMS
    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // TOTAL PRICE
    const cartTotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                clearCart,
                cartCount,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return context;
}