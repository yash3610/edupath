import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import { dashboardPathForRole, useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function LoginPage() {
  const { user, login } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: "" });

  useEffect(() => {
    if (!user) return;
    const requestedPath = location.state?.from?.pathname;
    window.location.replace(requestedPath || dashboardPathForRole(user.role));
  }, [location.state, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      const result = await login(form);
      const loggedInUser = result.data?.user;
      toast.success("Welcome back! Redirecting you now.", "Login successful");
      const requestedPath = location.state?.from?.pathname;
      window.location.replace(requestedPath || dashboardPathForRole(loggedInUser?.role));
    } catch (error) {
      setStatus({ loading: false, error: error.message });
      toast.error(error.message, "Login failed");
    }
  }

  return (
    <>
      <Breadcrumb title="Login" />
      <section className="ep-auth auth-login section-gap position-relative">
        <div className="container ep-container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6 col-md-10 col-12">
              <div className="ep-auth__card">
                <div className="ep-auth__card-head">
                  <h3 className="ep-auth__card-title">Welcome back!</h3>
                  <p className="ep-auth__card-text">Log in to continue learning</p>
                </div>
                <div className="ep-auth__card-body">
                  <form className="ep-auth__card-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="login-email">Your Email</label>
                      <input id="login-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="login-password">Password</label>
                      <div className="form-group-input">
                        <input id="login-password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
                        <button type="button" className="toggle-password" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
                      </div>
                    </div>
                    {status.error && <p className="form-message form-message--error" role="alert">{status.error}</p>}
                    <div className="ep-auth__card-form-btn">
                      <button type="submit" className="ep-btn" disabled={status.loading}>{status.loading ? "Logging in..." : "Log In"}</button>
                    </div>
                  </form>
                </div>
                <div className="ep-auth__card-bottom">
                  <span>Do not have an account?</span> <Link to="/register">Sign up for free</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
