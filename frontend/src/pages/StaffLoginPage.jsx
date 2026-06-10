import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import { dashboardPathForRole, useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const roleContent = {
  admin: {
    label: "Admin",
    heading: "Admin Login",
    text: "Manage users, courses, quizzes, and platform activity.",
  },
  instructor: {
    label: "Instructor",
    heading: "Instructor Login",
    text: "Manage courses, assessments, and learner progress.",
  },
};

export default function StaffLoginPage() {
  const { user, login } = useAuth();
  const toast = useToast();
  const [role, setRole] = useState("admin");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const content = roleContent[role];

  useEffect(() => {
    if (user) window.location.replace(dashboardPathForRole(user.role));
  }, [user]);

  function selectRole(nextRole) {
    setRole(nextRole);
    setStatus({ loading: false, error: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      const result = await login(form);
      const loggedInUser = result.data?.user;
      toast.success(`Welcome, ${loggedInUser?.name || content.label}.`, "Login successful");
      window.location.replace(dashboardPathForRole(loggedInUser?.role));
    } catch (error) {
      setStatus({ loading: false, error: error.message });
      toast.error(error.message, "Login failed");
    }
  }

  return (
    <>
      <Breadcrumb title="Staff Login" />
      <section className={`ep-auth role-auth role-auth--${role} section-gap position-relative`}>
        <div className="container ep-container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6 col-md-10 col-12">
              <div className="ep-auth__card role-auth__card">
                <div className="staff-role-tabs" aria-label="Select login type">
                  {Object.entries(roleContent).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      className={`staff-role-tab ${role === key ? "is-active" : ""}`}
                      onClick={() => selectRole(key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="ep-auth__card-head">
                  <h3 className="ep-auth__card-title">{content.heading}</h3>
                  <p className="ep-auth__card-text">{content.text}</p>
                </div>

                <div className="ep-auth__card-body">
                  <form className="ep-auth__card-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="staff-email">Work Email</label>
                      <input id="staff-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="staff-password">Password</label>
                      <div className="form-group-input">
                        <input id="staff-password" type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" required />
                        <button type="button" className="toggle-password" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
                      </div>
                    </div>
                    {status.error && <p className="form-message form-message--error" role="alert">{status.error}</p>}
                    <div className="ep-auth__card-form-btn">
                      <button type="submit" className="ep-btn" disabled={status.loading}>
                        {status.loading ? "Signing in..." : `Login as ${content.label}`}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="ep-auth__card-bottom">
                  <Link to="/">Back to website</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
