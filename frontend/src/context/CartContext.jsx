import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_KEY = "edupath_cart";

export function CartProvider({ children }) {
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
    if (items.some((item) => item._id === course._id)) return;
    persist([...items, { ...course, quantity: 1 }]);
  }

  function removeCourse(courseId) {
    persist(items.filter((item) => item._id !== courseId));
  }

  const value = useMemo(() => ({
    items,
    addCourse,
    removeCourse,
    clearCart: () => persist([]),
    total: items.reduce((sum, item) => sum + Number(item.price || 0), 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
