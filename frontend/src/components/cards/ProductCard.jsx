import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="ep-product__card">
      <Link to={`/shop/${product.slug}`} className="ep-product__img">
        <img src={product.image} alt={product.title} />
      </Link>
      <div className="ep-product__content">
        <h5>
          <Link to={`/shop/${product.slug}`}>{product.title}</Link>
        </h5>
        <div className="ep-product__price">
          <span>${product.price}</span>
          {product.oldPrice ? <del>${product.oldPrice}</del> : null}
        </div>
      </div>
    </div>
  );
}
