// components/Navbar.tsx
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import NotificationBell from "@/components/notifications/NotificationBell";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaTrashAlt,
} from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Cart
  const { items, itemCount, subtotalFormatted, removeItem } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  // Dropdown usuario
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Sesión cerrada exitosamente.");
      router.push("/login");
    } catch (error) {
      console.error("Navbar: Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión. Inténtalo de nuevo.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinkClasses = (href: string) =>
    `relative block px-4 py-2 rounded-lg text-sm font-semibold
     ${
       router.pathname === href
         ? "text-white bg-blue-600 shadow-inner"
         : "text-blue-100 hover:text-white hover:bg-blue-600"
     }`;

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName.split(" ")[0];
    if (user?.email) return user.email.split("@")[0];
    return "Usuario";
  };

  if (loading) return null;

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-blue-700 shadow-xl relative z-50 font-inter">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* TOPBAR */}
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 text-white text-3xl font-extrabold tracking-tight">
              MenthIA
            </Link>
          </div>

          {/* Desktop Nav + Actions */}
          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4">
            {user ? (
              <>
                <Link href="/dashboard/inicio" className={navLinkClasses("/dashboard/inicio")}>
                  Inicio
                </Link>
                <Link href="/dashboard/diagnostico" className={navLinkClasses("/dashboard/diagnostico")}>
                  Diagnóstico
                </Link>
                <Link href="/dashboard/mentoria" className={navLinkClasses("/dashboard/mentoria")}>
                  Mentoría
                </Link>
                <Link href="/dashboard/cursos" className={navLinkClasses("/dashboard/cursos")}>
                  Cursos
                </Link>
                <Link href="/dashboard/marketplace" className={navLinkClasses("/dashboard/marketplace")}>
                  Marketplace
                </Link>
                <Link href="/plans" className={navLinkClasses("/plans")}>
                  Planes y Paquetes
                </Link>
                <Link href="/dashboard/ayuda" className={navLinkClasses("/dashboard/ayuda")}>
                  Ayuda
                </Link>
                <Link href="/dashboard/pagos" className={navLinkClasses("/dashboard/pagos")}>
                  Pagos
                </Link>

                {/* Notificaciones (campanita con el MISMO icono) */}
                <NotificationBell
                  renderTrigger={({ count, onToggle }) => (
                    <button
                      onClick={onToggle}
                      className="relative text-white hover:text-yellow-300 p-2 rounded-lg"
                      aria-label="Notificaciones"
                    >
                      <IoNotificationsOutline className="h-6 w-6" />
                      {count > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-red-600 text-white px-1.5 py-0.5">
                          {count}
                        </span>
                      )}
                    </button>
                  )}
                />

                {/* Carrito (desktop) — SOLO ICONO */}
                <div className="relative" ref={cartRef}>
                  <button
                    onClick={() => setCartOpen((s) => !s)}
                    className="relative p-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                    aria-label="Abrir carrito"
                  >
                    <FaShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-white text-blue-700 px-1.5 py-0.5">
                        {itemCount}
                      </span>
                    )}
                  </button>

                  {/* Mini dropdown del carrito */}
                  {cartOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50">
                      <div className="p-3 border-b">
                        <div className="text-sm font-semibold text-gray-800">Tu carrito</div>
                        <div className="text-xs text-gray-500">
                          {itemCount > 0 ? `${itemCount} artículo(s)` : "Vacío"}
                        </div>
                      </div>

                      <div className="max-h-80 overflow-auto divide-y">
                        {items.slice(0, 3).map((it) => (
                          <div key={it.id} className="flex items-center gap-3 p-3">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden grid place-items-center">
                              {it.image ? (
                                <Image
                                  src={it.image}
                                  alt={it.title}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <FaShoppingCart className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800 line-clamp-1">{it.title}</div>
                              <div className="text-xs text-gray-500">
                                {it.kind} · x{it.quantity}
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(it.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                              aria-label="Eliminar del carrito"
                              title="Eliminar"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        ))}
                        {items.length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-500">No hay productos</div>
                        )}
                        {items.length > 3 && (
                          <div className="p-2 text-center text-xs text-gray-500">
                            y {items.length - 3} artículo(s) más…
                          </div>
                        )}
                      </div>

                      <div className="p-3 border-t">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold text-gray-900">{subtotalFormatted}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href="/cart"
                            onClick={() => setCartOpen(false)}
                            className="flex-1 text-center px-3 py-2 rounded-lg border text-sm font-semibold hover:bg-gray-50"
                          >
                            Ver carrito
                          </Link>
                          <Link
                            href="/checkout"
                            onClick={() => setCartOpen(false)}
                            className="flex-1 text-center px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                          >
                            Ir a pagar
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dropdown de usuario */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    disabled={isLoggingOut}
                  >
                    <FaUserCircle className="mr-2" /> Hola, {getUserDisplayName()}
                    <svg
                      className="ml-2 -mr-0.5 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <Link
                        href="/perfil"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaCog className="mr-2" /> Mi Perfil
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md"
                        disabled={isLoggingOut}
                      >
                        <FaSignOutAlt className="mr-2" /> {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/" className={navLinkClasses("/")}>
                  Inicio
                </Link>
                <Link href="/services" className={navLinkClasses("/services")}>
                  Servicios
                </Link>
                <Link href="/community" className={navLinkClasses("/community")}>
                  Comunidad
                </Link>

                {/* Carrito también disponible para invitados — SOLO ICONO */}
                <div className="relative" ref={cartRef}>
                  <button
                    onClick={() => setCartOpen((s) => !s)}
                    className="relative p-2 rounded-lg text-blue-100 hover:text-white hover:bg-blue-600"
                    aria-label="Abrir carrito"
                  >
                    <FaShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-white text-blue-700 px-1.5 py-0.5">
                        {itemCount}
                      </span>
                    )}
                  </button>

                  {cartOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50">
                      <div className="p-3 border-b">
                        <div className="text-sm font-semibold text-gray-800">Tu carrito</div>
                        <div className="text-xs text-gray-500">
                          {itemCount > 0 ? `${itemCount} artículo(s)` : "Vacío"}
                        </div>
                      </div>
                      <div className="max-h-80 overflow-auto divide-y">
                        {items.slice(0, 3).map((it) => (
                          <div key={it.id} className="flex items-center gap-3 p-3">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden grid place-items-center">
                              {it.image ? (
                                <Image
                                  src={it.image}
                                  alt={it.title}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <FaShoppingCart className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800 line-clamp-1">{it.title}</div>
                              <div className="text-xs text-gray-500">
                                {it.kind} · x{it.quantity}
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(it.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                              aria-label="Eliminar del carrito"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        ))}
                        {items.length === 0 && (
                          <div className="p-4 text-center text-sm text-gray-500">No hay productos</div>
                        )}
                      </div>
                      <div className="p-3 border-t">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold text-gray-900">{subtotalFormatted}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href="/cart"
                            onClick={() => setCartOpen(false)}
                            className="flex-1 text-center px-3 py-2 rounded-lg border text-sm font-semibold hover:bg-gray-50"
                          >
                            Ver carrito
                          </Link>
                          <Link
                            href="/checkout"
                            onClick={() => setCartOpen(false)}
                            className="flex-1 text-center px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                          >
                            Ir a pagar
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Acceso */}
                <button
                  onClick={() => router.push("/register")}
                  className="bg-blue-600 px-4 py-2 rounded-full text-sm font-semibold text-white hover:bg-blue-700 shadow-md"
                >
                  Registro
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-blue-600 hover:bg-gray-200 shadow-md border border-gray-200"
                >
                  Iniciar Sesión
                </button>
              </>
            )}
          </div>

          {/* Mobile: carrito + hamburguesa */}
          <div className="-mr-2 flex md:hidden items-center gap-2">
            {/* Cart quick access (mobile) — icono */}
            <button
              onClick={() => router.push("/cart")}
              className="relative p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Carrito"
            >
              <FaShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-white text-blue-700 px-1.5 py-0.5">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Notificaciones mobile (mismo icono) */}
            <NotificationBell
              renderTrigger={({ count, onToggle }) => (
                <button
                  onClick={onToggle}
                  className="relative p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Notificaciones"
                >
                  <IoNotificationsOutline className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-red-600 text-white px-1.5 py-0.5">
                      {count}
                    </span>
                  )}
                </button>
              )}
            />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen ? "true" : "false"}
            >
              <span className="sr-only">Abrir menú principal</span>
              {!mobileMenuOpen ? <FaBars className="block h-6 w-6" /> : <FaTimes className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden absolute top-0 left-0 w-full h-screen bg-blue-700 bg-opacity-95 flex flex-col items-center justify-center space-y-8 z-40"
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-white focus:outline-none"
          >
            <FaTimes size={30} />
          </button>

          {user ? (
            <>
              <Link
                href="/dashboard/inicio"
                className="text-white text-3xl font-bold hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/dashboard/diagnostico"
                className="text-white text-3xl font-bold hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Diagnóstico
              </Link>
              <Link
                href="/dashboard/mentoria"
                className="text-white text-3xl font-bold hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mentoría
              </Link>
              <Link
                href="/dashboard/cursos"
                className="text-white text-3xl font-bold hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cursos
              </Link>
              <Link
                href="/dashboard/marketplace"
                className="text-white text-3xl font-bold hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>

              {/* Carrito (móvil) */}
              <Link
                href="/cart"
                className="text-white text-3xl font-bold hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Carrito {itemCount > 0 ? `(${itemCount})` : ""}
              </Link>

              <div className="border-t border-blue-500 w-2/3 my-4" />
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold text-xl hover:bg-red-700 shadow-lg"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="text-white text-3xl font-bold hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/services"
                className="text-white text-3xl font-bold hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link
                href="/community"
                className="text-white text-3xl font-bold hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comunidad
              </Link>

              {/* Carrito (móvil) para invitado */}
              <Link
                href="/cart"
                className="text-white text-3xl font-bold hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Carrito {itemCount > 0 ? `(${itemCount})` : ""}
              </Link>

              <div className="border-t border-blue-500 w-2/3 my-4" />

              <button
                onClick={() => {
                  router.push("/register");
                  setMobileMenuOpen(false);
                }}
                className="bg-blue-600 px-4 py-2 rounded-full text-sm font-semibold text-white hover:bg-blue-700 shadow-md"
              >
                Registro
              </button>
              <button
                onClick={() => {
                  router.push("/login");
                  setMobileMenuOpen(false);
                }}
                className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-blue-600 hover:bg-gray-200 shadow-md border border-gray-200"
              >
                Iniciar Sesión
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
