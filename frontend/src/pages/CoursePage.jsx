import React, { useMemo, useState } from "react";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import CourseCard from "../components/cards/CourseCard.jsx";
import useApiResource from "../hooks/useApiResource.js";

export default function CoursePage() {
  const { data, loading, error } = useApiResource("courses");
  const [query, setQuery] = useState("");
  const courses = useMemo(
    () => data.filter((course) => `${course.title} ${course.category} ${course.instructor}`.toLowerCase().includes(query.toLowerCase())),
    [data, query]
  );

  return (
    <>
      <Breadcrumb title="Courses" />
      <section className="ep-course section-gap position-relative">
        <div className="container ep-container">
          <div className="ep-course__filter">
            <div className="row align-items-center">
              <div className="col-lg-6 col-12"><div className="ep-course__result"><h3 className="ep-course__result-title">Showing</h3><span className="ep-course__result-data">{courses.length} courses</span></div></div>
              <div className="col-lg-6 col-12"><div className="ep-course__search"><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses" aria-label="Search courses" /></div></div>
            </div>
          </div>
          {loading && <p className="text-center">Loading courses...</p>}
          {error && <p className="form-message form-message--error text-center">{error}</p>}
          <div className="row">
            {courses.map((course) => <div className="col-lg-6 col-xl-4 col-md-6 col-12 mg-top-30" key={course._id}><CourseCard course={course} /></div>)}
          </div>
          {!loading && !error && courses.length === 0 && <p className="text-center">No courses found.</p>}
        </div>
      </section>
    </>
  );
}
