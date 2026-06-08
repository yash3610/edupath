import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../services/api.js";

export default function CourseDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { items, addCourse } = useCart();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.course(slug).then((result) => setCourse(result.data)).catch((requestError) => setError(requestError.message));
  }, [slug]);

  if (error) return <><Breadcrumb title="Course details" /><div className="section-gap text-center"><p>{error}</p><Link to="/course" className="ep-btn">Back to courses</Link></div></>;
  if (!course) return <><Breadcrumb title="Course details" /><div className="section-gap text-center">Loading course...</div></>;

  const inCart = items.some((item) => item._id === course._id);
  function enroll() {
    addCourse(course);
    navigate("/cart");
  }

  return (
    <>
      <Breadcrumb title="Course details" />
      <section className="ep-course-details section-gap">
        <div className="container ep-container">
          <div className="row">
            <div className="col-lg-8 col-12">
              <div className="ep-course__details">
                <div className="ep-course__details-img"><img src={course.image} alt={course.title} /></div>
                <div className="ep-course__overview mg-top-30">
                  <span className="ep-course__tag ep1-bg">{course.category}</span>
                  <h2 className="mg-top-20">{course.title}</h2>
                  <p className="ep-course__overview-text mg-top-20">{course.description}</p>
                  <div className="ep-course__overview-widget mg-top-30">
                    <h3 className="ep-course__overview-title">What you will learn</h3>
                    <ul>
                      <li><i className="fi fi-rs-check" /> Practical, project-focused lessons</li>
                      <li><i className="fi fi-rs-check" /> Lifetime access to learning resources</li>
                      <li><i className="fi fi-rs-check" /> Guidance from {course.instructor}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-12">
              <aside className="ep-course__sidebar">
                <div className="ep-course__sidebar-data">
                  <h4 className="ep-course__sidebar-title">Course Includes</h4>
                  <ul className="ep-course__sidebar-data-list">
                    <li><span>Price:</span><strong className="price">₹{Number(course.price || 0).toFixed(2)}</strong></li>
                    <li><span>Instructor:</span><strong>{course.instructor}</strong></li>
                    <li><span>Rating:</span><strong>{course.rating || 5}/5</strong></li>
                    <li><span>Access:</span><strong>Lifetime</strong></li>
                  </ul>
                  <button type="button" className="ep-btn course-enroll-button" onClick={enroll}>{inCart ? "Go to Cart" : "Enroll Now"}</button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
