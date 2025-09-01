// components/commerce/AddToCartButton.tsx
import React from "react";
import { useCart } from "../../contexts/CartContext";
import { Product } from "../../types/commerce";

// Si tienes exportado el tipo CartItem desde el CartContext, úsalo aquí.
// import type { CartItem } from "../../contexts/CartContext";

// Adaptador mínimo: asegura que exista "title" y pasa quantity en el mismo objeto.
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
    // Normaliza el campo que el carrito espera (title vs name)
    const title =
      (product as any).title ??
      (product as any).name ??
      "Producto";

    // Construye el objeto en una sola pieza (lo que addItem tipa como Omit<CartItem, 'quantity'> & { quantity?: number })
    const addable = {
      ...product,
      title,            // Asegura que exista
      quantity: qty,    // addItem permite quantity opcional; ponerlo no rompe
    } as any; // <-- si exportas el tipo CartItem, reemplaza 'any' por ese tipo compatible

    addItem(addable);
  };

  return (
    <button className={className} onClick={handleClick}>
      Agregar al carrito
    </button>
  );
};

export default AddToCartButton;
