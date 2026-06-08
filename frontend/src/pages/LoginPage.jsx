import React from "react";

export default function LoginPage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Login</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/login">Login</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-auth auth-login section-gap position-relative">
                      <div className="container ep-container">
                        <div className="row justify-content-center">
                          <div className="col-lg-8 col-xl-6 col-md-10 col-12">
                            <div className="ep-auth__card">
                              <div className="ep-auth__card-head">
                                <h3 className="ep-auth__card-title">Welcome back!</h3>
                                <p className="ep-auth__card-text">Log in to your account</p>
                                <div className="ep-auth__card-social">
                                  <a href="#" target="_blank">
                                    <img src="/assets/images/icons/google.svg" alt="google-icon" />Login with Google
                                  </a>
                                  <a href="#" target="_blank">
                                    <img src="/assets/images/icons/facebook.svg" alt="facebook-icon" />Login with Facebook
                                  </a>
                                </div>
                                <div className="ep-auth__another-way">
                                  Or log in with Email
                                </div>
                              </div>
                              <div className="ep-auth__card-body">
                                <form action="#" method="post" className="ep-auth__card-form">
                                  <div className="form-group">
                                    <label>Your Email</label>
                                    <input type="email" name="email" placeholder="Email address" required />
                                  </div>
                                  <div className="form-group">
                                    <label>Password</label>
                                    <div className="form-group-input">
                                      <input type="password" id="password" name="password" placeholder="Enter Password" required />
                                      <span className="toggle-password" data-password-toggle="password">Show</span>
                                    </div>
                                  </div>
                                  <div className="ep-auth__card-info">
                                    <div className="form-check">
                                      <input type="checkbox" id="custom-checkbox" className="form-check-input" />
                                      <label title htmlFor="custom-checkbox" className="form-check-label">Remember Me</label>
                                    </div>
                                    <a href="#">Forgot Password?</a>
                                  </div>
                                  <div className="ep-auth__card-form-btn">
                                    <button type="submit" className="ep-btn">Log In</button>
                                  </div>
                                </form>
                              </div>
                              <div className="ep-auth__card-bottom">
                                <span>Don’t have an account?</span>
                                <a href="/register">Sign Up for free</a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
    </>
  );
}
