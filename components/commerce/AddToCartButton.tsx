// components/commerce/AddToCartButton.tsx
import React from "react";
import { useCart } from "../../contexts/CartContext";
import { Product } from "../../types/commerce";

const AddToCartButton: React.FC<{ product: Product; qty?: number; className?: string }> = ({
  product,
  qty = 1,
  className = "px-4 py-2 rounded-lg bg-indigo-600 text-white",
}) => {
  const { addItem } = useCart();
  return (
    <button className={className} onClick={() => addItem(product, qty)}>
      Agregar al carrito
    </button>
  );
};

export default AddToCartButton;
