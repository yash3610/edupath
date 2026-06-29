import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";

export default function CourseCard({ course }) {
  const { items, addCourse } = useCart();
  const inCart = items.some((item) => item._id === course._id);
  const image = course.image || course.thumbnail || "/assets/images/course/course-1/1.png";

  return (
    <article className="ep-course__card">
      <Link to={`/course/${course.slug}`} className="ep-course__img">
        <img src={image} alt={course.title} />
      </Link>
      <div className="ep-course__content">
        <span className="ep-course__category">{course.category}</span>
        <Link to={`/course/${course.slug}`}><h5 className="ep-course__title">{course.title}</h5></Link>
        <p>{course.description}</p>
        <div className="ep-course__bottom">
          <span>{course.instructor}</span>
          <strong>Rs. {Number(course.price || 0).toFixed(2)}</strong>
        </div>
        <div className="course-card-actions">
          <Link to={`/course/${course.slug}`} className="cart-text-link">View details</Link>
          <button type="button" className={`course-card-cart-button ${inCart ? "is-added" : ""}`} onClick={() => addCourse(course)}>
            <i className={inCart ? "fi fi-rs-check" : "fi fi-rr-shopping-cart"} /> {inCart ? "Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
