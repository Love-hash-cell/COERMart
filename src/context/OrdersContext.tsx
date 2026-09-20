import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

export type OrderStatus =
    | "Order Placed"
    | "Accepted"
    | "Preparing"
    | "Out for Delivery"
    | "Delivered"
    | "Cancelled";

export interface OrderItem {
    name: string;
    store: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    orderId: string;
    studentName: string;
    phone: string;
    deliveryType: string;
    location: string;
    roomNumber: string;
    instructions: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    estimatedDelivery: string;
    createdAt: string;
}

interface OrdersContextType {
    orders: Order[];
    addOrder: (order: Order) => void;
    updateOrderStatus: (
        orderId: string,
        status: OrderStatus
    ) => void;
}

const OrdersContext = createContext<
    OrdersContextType | undefined
>(undefined);

export function OrdersProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [orders, setOrders] = useState<Order[]>(() => {
        try {
            const savedOrders =
                localStorage.getItem("coermart_orders");

            if (!savedOrders) {
                return [];
            }

            const parsedOrders = JSON.parse(savedOrders);

            return Array.isArray(parsedOrders)
                ? parsedOrders
                : [];
        } catch {
            return [];
        }
    });

    // ============================================================
    // ADD ORDER
    // ============================================================

    const addOrder = (order: Order) => {
        setOrders((currentOrders) => {
            // Prevent duplicate order IDs
            const alreadyExists = currentOrders.some(
                (existingOrder) =>
                    existingOrder.orderId === order.orderId
            );

            const updatedOrders = alreadyExists
                ? currentOrders.map((existingOrder) =>
                    existingOrder.orderId === order.orderId
                        ? order
                        : existingOrder
                )
                : [
                    order,
                    ...currentOrders,
                ];

            // Save ALL orders
            localStorage.setItem(
                "coermart_orders",
                JSON.stringify(updatedOrders)
            );

            /*
             * IMPORTANT:
             *
             * Checkout.tsx saves multi-shop information
             * inside coermart_last_order:
             *
             * {
             *   orderIds: [
             *      "COER123456",
             *      "COER789012"
             *   ]
             * }
             *
             * Do NOT overwrite that object when multiple
             * shop orders are being created.
             */

            const savedLastOrder =
                localStorage.getItem(
                    "coermart_last_order"
                );

            let shouldPreserveMultiOrder = false;

            if (savedLastOrder) {
                try {
                    const parsedLastOrder =
                        JSON.parse(savedLastOrder);

                    if (
                        Array.isArray(
                            parsedLastOrder.orderIds
                        ) &&
                        parsedLastOrder.orderIds.length > 1
                    ) {
                        shouldPreserveMultiOrder = true;
                    }
                } catch {
                    shouldPreserveMultiOrder = false;
                }
            }

            // Only replace last order for a normal
            // single-order checkout.
            if (!shouldPreserveMultiOrder) {
                localStorage.setItem(
                    "coermart_last_order",
                    JSON.stringify(order)
                );
            }

            return updatedOrders;
        });

        // Notify OrderTracking that a new order was placed
        window.dispatchEvent(
            new Event("order-placed")
        );
    };

    // ============================================================
    // UPDATE ORDER STATUS
    // ============================================================

    const updateOrderStatus = (
        orderId: string,
        status: OrderStatus
    ) => {
        setOrders((currentOrders) => {
            const updatedOrders =
                currentOrders.map((order) =>
                    order.orderId === orderId
                        ? {
                            ...order,
                            status,
                        }
                        : order
                );

            // Save all orders
            localStorage.setItem(
                "coermart_orders",
                JSON.stringify(updatedOrders)
            );

            /*
             * Update the matching order inside
             * coermart_last_order without destroying
             * the other multi-shop order IDs.
             */
            const savedLastOrder =
                localStorage.getItem(
                    "coermart_last_order"
                );

            if (savedLastOrder) {
                try {
                    const parsedLastOrder =
                        JSON.parse(savedLastOrder);

                    // Multi-shop checkout
                    if (
                        Array.isArray(
                            parsedLastOrder.orderIds
                        )
                    ) {
                        const updatedLastOrder = {
                            ...parsedLastOrder,
                            status:
                                parsedLastOrder.orderId ===
                                    orderId
                                    ? status
                                    : parsedLastOrder.status,
                        };

                        localStorage.setItem(
                            "coermart_last_order",
                            JSON.stringify(
                                updatedLastOrder
                            )
                        );
                    } else if (
                        parsedLastOrder.orderId ===
                        orderId
                    ) {
                        // Normal single order
                        localStorage.setItem(
                            "coermart_last_order",
                            JSON.stringify({
                                ...parsedLastOrder,
                                status,
                            })
                        );
                    }
                } catch {
                    // Ignore invalid localStorage
                }
            }

            // Also update the individual order if it exists
            const updatedOrder =
                updatedOrders.find(
                    (order) =>
                        order.orderId === orderId
                );

            if (updatedOrder) {
                const savedOrderIds =
                    getSavedOrderIds();

                if (
                    savedOrderIds.length <= 1
                ) {
                    localStorage.setItem(
                        "coermart_last_order",
                        JSON.stringify(
                            updatedOrder
                        )
                    );
                }
            }

            // Tell OrderTracking to refresh
            window.dispatchEvent(
                new Event(
                    "order-status-updated"
                )
            );

            return updatedOrders;
        });
    };

    // ============================================================
    // GET SAVED ORDER IDS
    // ============================================================

    const getSavedOrderIds = (): string[] => {
        const orderIds: string[] = [];

        try {
            const savedLastOrder =
                localStorage.getItem(
                    "coermart_last_order"
                );

            if (savedLastOrder) {
                const parsedLastOrder =
                    JSON.parse(savedLastOrder);

                if (
                    Array.isArray(
                        parsedLastOrder.orderIds
                    )
                ) {
                    parsedLastOrder.orderIds.forEach(
                        (id: string) => {
                            if (
                                id &&
                                !orderIds.includes(id)
                            ) {
                                orderIds.push(id);
                            }
                        }
                    );
                }

                if (
                    parsedLastOrder.orderId &&
                    !orderIds.includes(
                        parsedLastOrder.orderId
                    )
                ) {
                    orderIds.push(
                        parsedLastOrder.orderId
                    );
                }
            }
        } catch {
            // Ignore invalid localStorage
        }

        return orderIds;
    };

    return (
        <OrdersContext.Provider
            value={{
                orders,
                addOrder,
                updateOrderStatus,
            }}
        >
            {children}
        </OrdersContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(
        OrdersContext
    );

    if (!context) {
        throw new Error(
            "useOrders must be used inside OrdersProvider"
        );
    }

    return context;
}