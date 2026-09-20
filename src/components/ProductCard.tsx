import { Clock, Heart, Plus, Star } from "lucide-react";
import { useCart } from "../context/CartContext";

export interface Product {
    productId?: string;
    name: string;
    store: string;
    price: number;
    oldPrice?: number;
    rating: number;
    time: string;
    image: string;
    tag?: string;
}

interface ProductCardProps {
    product: Product;
}

function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();

    return (
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">

            {/* Image */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Tag */}
                {product.tag && (
                    <span className="absolute left-3 top-3 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-red-500 shadow-sm">
                        {product.tag}
                    </span>
                )}

                {/* Favorite */}
                <button
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:text-red-500"
                    aria-label={`Add ${product.name} to favorites`}
                >
                    <Heart size={17} />
                </button>

                {/* Store */}
                <div className="absolute bottom-3 left-3 text-xs font-medium text-white">
                    {product.store}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                    {product.name}
                </h3>

                {/* Rating + Time */}
                <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 font-bold text-green-600">
                        <Star size={13} fill="currentColor" />
                        {product.rating}
                    </span>

                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Clock size={13} />
                        {product.time}
                    </span>
                </div>

                {/* Price + Add */}
                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <span className="text-lg font-black text-gray-900 dark:text-white">
                            ₹{product.price}
                        </span>

                        {product.oldPrice && (
                            <span className="ml-2 text-xs text-gray-400 line-through">
                                ₹{product.oldPrice}
                            </span>
                        )}
                    </div>

                    {/* Add To Cart */}
                    <button
                        onClick={() => addToCart(product)}
                        className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-600 hover:shadow-md"
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <Plus size={15} />
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;