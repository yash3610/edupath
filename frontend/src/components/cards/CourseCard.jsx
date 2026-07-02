import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { assetUrl } from "../../services/api.js";

const fallbackImage = "/assets/images/course/course-1/1.png";

export default function CourseCard({ course }) {
  const { items, addCourse } = useCart();
  const inCart = items.some((item) => item._id === course._id);
  const slug = course.slug || course._id || course.id;
  const image = assetUrl(course.image || course.thumbnail || course.cover) || fallbackImage;
  const category = typeof course.category === "object" ? course.category?.name : course.category;
  const instructor = typeof course.instructor === "object" ? course.instructor?.name : course.instructor;
  const description = course.cardDescription || course.shortDescription || course.description || course.fullDescription || "";

  return (
    <article className="ep-course__card">
      <Link to={`/course/${slug}`} className="ep-course__img">
        <img src={image} alt={course.title || "Course"} />
      </Link>
      <div className="ep-course__body">
        <span className="ep-course__category">{category || "Course"}</span>
        <Link to={`/course/${slug}`}><h5 className="ep-course__title">{course.title || "Untitled course"}</h5></Link>
        <p>{description}</p>
        <div className="ep-course__bottom">
          <span>{instructor || "EduPath Instructor"}</span>
          <strong>Rs. {Number(course.price || 0).toFixed(2)}</strong>
        </div>
        <div className="course-card-actions">
          <Link to={`/course/${slug}`} className="cart-text-link">View details</Link>
          <button type="button" className={`course-card-cart-button ${inCart ? "is-added" : ""}`} onClick={() => addCourse(course)}>
            <i className={inCart ? "fi fi-rs-check" : "fi fi-rr-shopping-cart"} /> {inCart ? "Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
