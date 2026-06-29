import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api, apiRequest } from "../services/api.js";

export default function CourseDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, addCourse } = useCart();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    setError("");
    api.course(slug)
      .then(async (result) => {
        if (!mounted) return;
        setCourse(result.data);
        if (user?.role === "student" && result.data?._id) {
          try {
            const enrollment = await apiRequest(`/api/enrollments/check/${result.data._id}`);
            if (mounted) setEnrolled(Boolean(enrollment.data?.enrolled));
          } catch {
            if (mounted) setEnrolled(false);
          }
        }
      })
      .catch((requestError) => mounted && setError(requestError.message));
    return () => { mounted = false; };
  }, [slug, user?.role]);

  if (error) return <><Breadcrumb title="Course details" /><div className="section-gap text-center"><p>{error}</p><Link to="/course" className="ep-btn">Back to courses</Link></div></>;
  if (!course) return <><Breadcrumb title="Course details" /><div className="section-gap text-center">Loading course...</div></>;

  const inCart = items.some((item) => item._id === course._id);
  const price = Number(course.discountPrice ?? course.price ?? 0);
  const isFree = course.pricingType === "free" || price <= 0;
  const outcomes = list(course.learningOutcomes).length ? list(course.learningOutcomes) : ["Practical, project-focused lessons", "Lifetime access to learning resources", `Guidance from ${course.instructor}`];
  const requirements = list(course.requirements);
  const modules = course.modules || [];
  const image = course.image || course.thumbnail || "/assets/images/course/course-1/1.png";

  function addToCart() {
    if (!inCart) addCourse(course);
    navigate("/cart");
  }

  async function enrollOrContinue() {
    if (enrolled) {
      navigate(`/dashboard/learn/${course._id}`);
      return;
    }
    if (!user) {
      navigate("/login", { state: { from: `/course/${slug}` } });
      return;
    }
    if (user.role !== "student") {
      navigate("/dashboard");
      return;
    }
    if (!isFree) {
      addToCart();
      return;
    }
    try {
      setBusy(true);
      await apiRequest(`/api/enrollments/free/${course._id}`, { method: "POST", body: JSON.stringify({}) });
      setEnrolled(true);
      navigate(`/dashboard/learn/${course._id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Breadcrumb title="Course details" />
      <section className="ep-course-details section-gap">
        <div className="container ep-container">
          <div className="row">
            <div className="col-lg-8 col-12">
              <div className="ep-course__details">
                <div className="ep-course__details-img"><img src={image} alt={course.title} /></div>
                <div className="ep-course__overview mg-top-30">
                  <span className="ep-course__tag ep1-bg">{course.category}</span>
                  <h2 className="mg-top-20">{course.title}</h2>
                  <p className="ep-course__overview-text mg-top-20">{course.description || course.shortDescription}</p>
                  <div className="ep-course__overview-widget mg-top-30">
                    <h3 className="ep-course__overview-title">What you will learn</h3>
                    <ul>
                      {outcomes.map((item) => <li key={item}><i className="fi fi-rs-check" /> {item}</li>)}
                    </ul>
                  </div>
                  {requirements.length > 0 && (
                    <div className="ep-course__overview-widget mg-top-30">
                      <h3 className="ep-course__overview-title">Requirements</h3>
                      <ul>{requirements.map((item) => <li key={item}><i className="fi fi-rs-check" /> {item}</li>)}</ul>
                    </div>
                  )}
                  {modules.length > 0 && (
                    <div className="ep-course__overview-widget mg-top-30">
                      <h3 className="ep-course__overview-title">Curriculum</h3>
                      <div className="course-curriculum-list">
                        {modules.map((module, moduleIndex) => (
                          <div key={module._id || module.title} className="course-curriculum-module">
                            <strong>{moduleIndex + 1}. {module.title}</strong>
                            <ul>
                              {(module.lectures || []).map((lecture, lectureIndex) => (
                                <li key={lecture._id || lecture.title}>
                                  <i className="fi fi-rs-play" /> {lectureIndex + 1}. {lecture.title}
                                  <span>{lecture.type || "lesson"} {lecture.isPreview ? " · Preview" : ""}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-12">
              <aside className="ep-course__sidebar">
                <div className="ep-course__sidebar-data">
                  <h4 className="ep-course__sidebar-title">Course Includes</h4>
                  <ul className="ep-course__sidebar-data-list">
                    <li><span>Price:</span><strong className="price">{isFree ? "Free" : `Rs. ${price.toFixed(2)}`}</strong></li>
                    <li><span>Instructor:</span><strong>{course.instructor}</strong></li>
                    <li><span>Rating:</span><strong>{course.rating || 5}/5</strong></li>
                    <li><span>Lessons:</span><strong>{course.lectureCount || modules.reduce((sum, module) => sum + (module.lectures?.length || 0), 0)}</strong></li>
                    <li><span>Level:</span><strong>{course.level || "beginner"}</strong></li>
                  </ul>
                  <button type="button" className="ep-btn course-enroll-button" onClick={enrollOrContinue} disabled={busy}>
                    <i className={enrolled ? "fi fi-rs-play" : inCart ? "fi fi-rs-shopping-cart-check" : "fi fi-rr-shopping-cart"} /> {busy ? "Please wait..." : enrolled ? "Continue Learning" : isFree ? "Enroll Free" : inCart ? "Go to Cart" : "Add to Cart"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function list(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}
