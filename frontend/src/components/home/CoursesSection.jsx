import React from "react";
import useApiResource from "../../hooks/useApiResource.js";
import { fallbackCourses } from "../../data/homeData.js";
import { Link } from "react-router-dom";

export default function CoursesSection() {
  const { data } = useApiResource("courses");
  const course = data[0] || fallbackCourses[0];

  return (
    <section className="ep-course ep-course--style2 section-gap pt-0 position-relative">
      <div className="container ep-container">
        <div className="col-12">
          <div className="ep-section-head ep-section-head--style2">
            <h3 className="ep-section-head__color-title ep1-color ep1-border-color">4.Our Courses</h3>
            <h2 className="ep-section-head__big-title ep-split-text left">Access Our Learning Resources &amp; <br />Browse Our Helpful Materials</h2>
          </div>
        </div>
        <div className="ep-brand-name"><img src="/assets/images/brand-name.svg" alt="brand-name" /></div>
        <div className="ep-course_shape rotate-ani"><img src="/assets/images/course/course-2/shape.svg" alt="shape" /></div>
        <div className="row">
          <div className="col-12">
            <div className="ep-course__wrapper position-relative mg-top-30">
              <div className="ep-course__cover-img">
                <img src="/assets/images/course/course-2/course-img.png" alt="course-img" />
              </div>
              <div className="owl-carousel ep-course__slider">
                <div className="ep-course__slider-item">
                  <div className="ep-course__slider-content">
                    <Link to={`/course/${course.slug || "web-development-bootcamp"}`} className="ep-course__title"><h3>{course.title}</h3></Link>
                    <span className="ep-course__price">${course.price || 25} <del>{course.oldPrice || 29.8}$</del></span>
                    <p className="ep-course__text">{course.description}</p>
                    <div className="ep-course__rattings">
                      <ul>
                        {[1, 2, 3, 4, 5].map((star) => <li key={star}><i className="icofont-star" /></li>)}
                      </ul>
                    </div>
                    <div className="ep-course__lesson">
                      <div className="ep-course__student"><i className="fi fi-rr-book-alt" /> 32 Lessons</div>
                      <div className="ep-course__student"><i className="fi fi-rr-users" /> 2k Students</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
