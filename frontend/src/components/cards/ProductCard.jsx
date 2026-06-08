import React from "react";

export default function ProductCard({ product }) {
  return (
    <div className="ep-product__card">
      <a href="/shop-single" className="ep-product__img">
        <img src={product.image} alt={product.title} />
      </a>
      <div className="ep-product__content">
        <h5>
          <a href="/shop-single">{product.title}</a>
        </h5>
        <div className="ep-product__price">
          <span>${product.price}</span>
          {product.oldPrice ? <del>${product.oldPrice}</del> : null}
        </div>
      </div>
    </div>
  );
}
