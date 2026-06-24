import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const products = [
  { id: "book-history", title: "World History: Ancient to Modern Times", image: "/assets/images/product/1.png", oldPrice: 100, price: 50, badge: "50% Discount", category: "History" },
  { id: "book-environment", title: "Environmental Science and Sustainability", image: "/assets/images/product/2.png", price: 150, category: "Science" },
  { id: "book-physics", title: "Modern Physics: Concepts and Applications", image: "/assets/images/product/3.png", price: 239, category: "Physics" },
  { id: "book-education", title: "Embrace the Power of Better Tomorrow Education", image: "/assets/images/product/4.png", price: 290, category: "Education" },
  { id: "book-childhood", title: "Early Childhood Education Practices", image: "/assets/images/product/5.png", price: 580, badge: "HOT", category: "Teaching" },
  { id: "book-python", title: "Basic Programming with Python", image: "/assets/images/product/6.png", oldPrice: 100, price: 50, badge: "50% Discount", category: "Programming" },
];

export default function ShopPage() {
  const { items, addItem } = useCart();
  const [sort, setSort] = useState("latest");
  const cartIds = new Set(items.map((item) => item._id));
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [sort]);

  function addBook(product) {
    addItem({
      _id: product.id,
      type: "book",
      title: product.title,
      image: product.image,
      price: product.price,
      author: product.category,
    });
  }

  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{ backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-6 col-12">
              <div className="ep-breadcrumbs__content">
                <h3 className="ep-breadcrumbs__title">All Products</h3>
                <ul className="ep-breadcrumbs__menu">
                  <li><Link to="/">Home</Link></li>
                  <li><i className="fi-bs-angle-right" /></li>
                  <li className="active"><Link to="/shop">Products</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="ep-product section-gap position-relative section-bg-1">
        <div className="container ep-container">
          <div className="row">
            <div className="col-12">
              <div className="ep-product__filter">
                <p className="ep-product__filter-result">
                  Showing <strong>{sortedProducts.length} <span>of</span> {products.length}</strong> Products
                </p>
                <div className="ep-product__filter-select">
                  <select value={sort} onChange={(event) => setSort(event.target.value)}>
                    <option value="latest">Latest Product</option>
                    <option value="low">Price Low to High</option>
                    <option value="high">Price High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            {sortedProducts.map((product, index) => {
              const inCart = cartIds.has(product.id);
              return (
                <div className="col-lg-4 col-md-6 col-12" key={product.id}>
                  <div className="ep-product__card wow fadeInUp" data-wow-delay={`.${3 + (index % 3) * 2}s`}>
                    <Link to="/shop-single" className="ep-product__img">
                      <img src={product.image} alt={product.title} />
                    </Link>
                    {product.badge && <div className="ep-product__label"><span className={product.badge === "HOT" ? "hot" : "discount"}>{product.badge}</span></div>}
                    <div className="ep-product__info">
                      <ul className="ep-product__rattings">
                        {[1, 2, 3, 4].map((star) => <li key={star}><i className="icofont-star" /></li>)}
                        <li><i className="icofont-star off-color" /></li>
                        <li><span>(5.0 / 2 Ratings)</span></li>
                      </ul>
                      <Link to="/shop-single" className="ep-product__title"><h5>{product.title}</h5></Link>
                      <div className="ep-product__info-bottom">
                        <button type="button" className={`shop-cart-button ${inCart ? "is-added" : ""}`} onClick={() => addBook(product)}>
                          <i className={inCart ? "fi fi-rs-check" : "fi fi-rr-shopping-cart"} /> {inCart ? "Added" : "Add to cart"}
                        </button>
                        <div className={product.oldPrice ? "ep-product__price" : "ep-product__price regular"}>
                          {product.oldPrice && <del>${product.oldPrice.toFixed(2)}</del>}
                          <span>${product.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
