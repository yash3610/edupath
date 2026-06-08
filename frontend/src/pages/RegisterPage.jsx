import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setStatus({ loading: false, error: "Passwords do not match" });
      toast.warning("Passwords do not match.");
      return;
    }
    setStatus({ loading: true, error: "" });
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success("Your account is ready. Start learning now.", "Account created");
      navigate("/course", { replace: true });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
      toast.error(error.message, "Registration failed");
    }
  }

  return (
    <>
      <Breadcrumb title="Registration" />
      <section className="ep-auth auth-login section-gap position-relative">
        <div className="container ep-container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6 col-md-10 col-12">
              <div className="ep-auth__card">
                <div className="ep-auth__card-head">
                  <h3 className="ep-auth__card-title">Create your account</h3>
                  <p className="ep-auth__card-text">Start learning with Edupath</p>
                </div>
                <div className="ep-auth__card-body">
                  <form className="ep-auth__card-form" onSubmit={handleSubmit}>
                    <div className="form-group"><label htmlFor="register-name">Full Name</label><input id="register-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required /></div>
                    <div className="form-group"><label htmlFor="register-email">Your Email</label><input id="register-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required /></div>
                    <div className="form-group"><label htmlFor="register-password">Password</label><input id="register-password" type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required /></div>
                    <div className="form-group"><label htmlFor="register-confirm">Confirm Password</label><input id="register-confirm" type="password" minLength="8" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} autoComplete="new-password" required /></div>
                    {status.error && <p className="form-message form-message--error" role="alert">{status.error}</p>}
                    <div className="ep-auth__card-form-btn"><button type="submit" className="ep-btn" disabled={status.loading}>{status.loading ? "Creating account..." : "Sign Up"}</button></div>
                  </form>
                </div>
                <div className="ep-auth__card-bottom"><span>Already have an account?</span> <Link to="/login">Login</Link></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
