import React, { createContext, useContext, useMemo, useState } from "react";
import { useToast } from "./ToastContext.jsx";

const CartContext = createContext(null);
const CART_KEY = "edupath_cart";

export function CartProvider({ children }) {
  const toast = useToast();
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  });

  function persist(nextItems) {
    setItems(nextItems);
    localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
  }

  function itemId(item) {
    return item._id || item.id;
  }

  function addItem(item) {
    const nextItem = { ...item, _id: itemId(item), type: item.type || "course", quantity: item.quantity || 1 };
    if (items.some((current) => itemId(current) === nextItem._id)) {
      toast.info(`${nextItem.title || "Item"} is already in your cart.`, "Already added");
      return;
    }
    persist([...items, nextItem]);
    toast.success(`${nextItem.title || "Item"} added to cart.`);
  }

  function addCourse(course) {
    addItem({ ...course, type: "course" });
  }

  function removeItem(id) {
    persist(items.filter((item) => itemId(item) !== id));
    toast.info("Item removed from cart.");
  }

  const courseItems = items.filter((item) => (item.type || "course") === "course");
  const productItems = items.filter((item) => (item.type || "course") !== "course");

  const value = useMemo(() => ({
    items,
    courseItems,
    productItems,
    addItem,
    addCourse,
    removeItem,
    removeCourse: removeItem,
    clearCart: () => {
      persist([]);
      toast.info("Cart cleared.");
    },
    total: items.reduce((sum, item) => sum + Number(item.price || 0), 0),
    courseTotal: courseItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
    productTotal: productItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
  }), [items, courseItems, productItems, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
