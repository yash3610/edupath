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

  function addCourse(course) {
    if (items.some((item) => item._id === course._id)) {
      toast.info("This course is already in your cart.", "Already added");
      return;
    }
    persist([...items, { ...course, quantity: 1 }]);
    toast.success(`${course.title || "Course"} added to cart.`);
  }

  function removeCourse(courseId) {
    persist(items.filter((item) => item._id !== courseId));
    toast.info("Course removed from cart.");
  }

  const value = useMemo(() => ({
    items,
    addCourse,
    removeCourse,
    clearCart: () => {
      persist([]);
      toast.info("Cart cleared.");
    },
    total: items.reduce((sum, item) => sum + Number(item.price || 0), 0),
  }), [items, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
