// components/commerce/AddToCartButton.tsx
import React from "react";
import { useCart } from "../../contexts/CartContext";
import { Product } from "../../types/commerce";

type CartItem = Product & { quantity: number; kind?: string };

const AddToCartButton: React.FC<{
  product: Product;
  qty?: number;
  className?: string;
}> = ({
  product,
  qty = 1,
  className = "px-4 py-2 rounded-lg bg-indigo-600 text-white",
}) => {
  const { addItem } = useCart();

  const handleClick = () => {
    const item: CartItem = {
      ...product,
      quantity: qty,
      // por si tu UI espera 'kind' en el mini carrito:
      kind: product.kind ?? "producto",
    };
    addItem(item); // ✅ ahora solo 1 argumento
  };

  return (
    <button className={className} onClick={handleClick}>
      Agregar al carrito
    </button>
  );
};

export default AddToCartButton;
