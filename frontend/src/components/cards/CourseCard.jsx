import React from "react";

export default function CourseCard({ course }) {
  return (
    <a href={`/course-details`} className="ep-course__card">
      <div className="ep-course__img">
        <img src={course.image} alt={course.title} />
      </div>
      <div className="ep-course__content">
        <span className="ep-course__category">{course.category}</span>
        <h5 className="ep-course__title">{course.title}</h5>
        <p>{course.description}</p>
        <div className="ep-course__bottom">
          <span>{course.instructor}</span>
          <strong>${course.price}</strong>
        </div>
      </div>
    </a>
  );
}
