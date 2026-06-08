import React from "react";

export default function BlogDetailsPage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Blog Details</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/blog-details">Blog Details</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-blog__details section-gap position-relative">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-lg-12 col-xl-8 col-12">
                            <div className="ep-blog__details-main">
                              <div className="ep-blog__details-top">
                                <span className="ep-blog__details-category">Technology</span>
                                <h2 className="ep-blog__details-title">
                                  Empowering Children Through Education
                                </h2>
                                <div className="ep-blog__details-cover">
                                  <div className="ep-blog__details-cover-img">
                                    <img src="/assets/images/blog/details/blog-details-img-1.jpg" alt="blog-img-1" />
                                  </div>
                                  <div className="ep-blog__details-date">
                                    21 September 2022
                                  </div>
                                  <ul className="ep-blog__details-meta">
                                    <li><i className="fi-rr-comments" />Comments (05)</li>
                                    <li><i className="fi fi-rr-tags" />Web design</li>
                                  </ul>
                                </div>
                                <p className="ep-blog__details-text">
                                  Aliquam eros justo, posuere loborti viverra laoreet
                                  matti ullamcorper posuere viverra .Aliquam eros justo,
                                  posuere lobortis, viverra laoreet augue mattis fermentum
                                  ullamcorper viverra laoreet Aliquam justo, posuere
                                  loborti viverra laoreet matti ullamcorper posuere
                                  viverra .Aliquam
                                </p>
                                <br />
                                <p className="ep-blog__details-text">
                                  Education is a vital aspect of a child's development.
                                  Preschools, elementary schools, and middle schools play
                                  a significant role in providing quality education and
                                  fostering growth in young
                                </p>
                              </div>
                              <div className="ep-blog__details-widget">
                                <h3 className="ep-blog__details-widget-title">
                                  Creating a Foundation for Success
                                </h3>
                                <p className="ep-blog__details-text">
                                  Education is a vital aspect of a child's development.
                                  Preschools, elementary schools, and middle schools play
                                  a significant role in providing quality education and
                                  fostering growth in young Education is a vital aspect of
                                  a child's development. Preschools, elementary schools,
                                  and middle
                                </p>
                                <br />
                                <ul className="ep-blog__details-list">
                                  <li>posuere loborti viverra laoreet ullamcorper</li>
                                  <li>posuere loborti viverra laoreet ullamcorper</li>
                                  <li>
                                    lobortis, viverra laoreet augue mattis fermentum
                                  </li>
                                  <li>
                                    lobortis, viverra laoreet augue mattis fermentum
                                  </li>
                                  <li>posuere loborti viverra laoreet ullamcorper</li>
                                  <li>posuere loborti viverra laoreet ullamcorper</li>
                                </ul>
                                <br />
                                <p className="ep-blog__details-text">
                                  Aliquam eros justo, posuere loborti viverra laoreet
                                  matti ullamcorper posuere viverra .Aliquam eros justo,
                                  posuere lobortis, viverra laoreet augue mattis fermentum
                                  ullamcorper viverra laoreet Aliquam eros justo, posuere
                                  loborti viverra laoreet matti ullamcorper posuere
                                  viverra .Aliquam eros justo, posuere lobortis non
                                </p>
                              </div>
                              <blockquote className="ep-blog__quote">
                                <i className="fi fi-rr-quote-right" />
                                <p>
                                  Education is a vital aspect of a child's development.
                                  Preschools, elementary schools, and middle schools play
                                  a significant role in providing quality education
                                </p>
                                <span>Sakib Hasan</span>
                              </blockquote>
                              <div className="ep-blog__details-widget">
                                <h3 className="ep-blog__details-widget-title">
                                  Little Einsteins Learning School
                                </h3>
                                <p className="ep-blog__details-text">
                                  Education is a vital aspect of a child's development.
                                  Preschools, elementary schools, and middle schools play
                                  a significant role in providing quality education and
                                  fostering growth in young Education is a vital aspect of
                                  a child's development. Preschools, elementary schools,
                                  and middle
                                </p>
                                <br />
                                <div className="ep-blog__details-widget-img">
                                  <img src="/assets/images/blog/details/blog-details-img-1.jpg" alt="blog-img-2" />
                                </div>
                              </div>
                              <div className="ep-blog__details-navigation">
                                <span>By Stanio lainto</span>
                                <ul className="ep-blog__navigation-tag">
                                  <li>
                                    <a href="#">Interiour</a>
                                  </li>
                                  <li>
                                    <a href="#">Ux design</a>
                                  </li>
                                  <li>
                                    <a href="#">Graphics</a>
                                  </li>
                                </ul>
                                <ul className="ep-blog__navigation-social">
                                  <li>
                                    <a href="#">
                                      <img src="/assets/images/blog/details/facebook.svg" alt="facebook-icon" />
                                    </a>
                                  </li>
                                  <li>
                                    <a href="#">
                                      <img src="/assets/images/blog/details/pinterest.svg" alt="pinterest-icon" />
                                    </a>
                                  </li>
                                  <li>
                                    <a href="#">
                                      <img src="/assets/images/blog/details/linkedin.svg" alt="linkedin-icon" />
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              <div className="ep-blog__details-comment">
                                <h3 className="ep-blog__comment-title">2 Comment</h3>
                                <div className="ep-blog__comment-item">
                                  <div className="ep-blog__comment-img">
                                    <img src="/assets/images/blog/details/comment-1.png" alt="comment-img" />
                                  </div>
                                  <div className="ep-blog__comment-info">
                                    <div className="ep-blog__comment-info-head">
                                      <h6 className="ep-blog__comment-name">Stanio lainto</h6>
                                      <p className="ep-blog__comment-date">
                                        January 16, 2024
                                      </p>
                                    </div>
                                    <p className="ep-blog__comment-text">
                                      Ished fact that a reader will be distrol acted bioii
                                      the.ished fact that a reader will be distrol acted
                                      laoreet Aliquam fact that a reader will be distrol
                                      acted Aliquam eros justo.
                                    </p>
                                    <a className="ep-blog__comment-reply">Reply</a>
                                  </div>
                                </div>
                                <div className="ep-blog__comment-item">
                                  <div className="ep-blog__comment-img">
                                    <img src="/assets/images/blog/details/comment-2.png" alt="comment-img" />
                                  </div>
                                  <div className="ep-blog__comment-info">
                                    <div className="ep-blog__comment-info-head">
                                      <h6 className="ep-blog__comment-name">Court Henry</h6>
                                      <p className="ep-blog__comment-date">
                                        January 16, 2024
                                      </p>
                                    </div>
                                    <p className="ep-blog__comment-text">
                                      Ished fact that a reader will be distrol acted bioii
                                      the.ished fact that a reader will be distrol acted
                                      laoreet Aliquam fact that a reader will be distrol
                                      acted Aliquam eros justo.
                                    </p>
                                    <a className="ep-blog__comment-reply">Reply</a>
                                  </div>
                                </div>
                              </div>
                              <div className="ep-blog__details-form">
                                <h3 className="ep-blog__details-form-title">
                                  Leave a Replay
                                </h3>
                                <p className="ep-blog__details-form-text">
                                  By using form u agree with the message sorage, you can
                                  contact us directly now
                                </p>
                                <form action="#" method="post">
                                  <div className="row">
                                    <div className="col-lg-6 col-md-6 col-12">
                                      <div className="form-group">
                                        <input type="text" name="your-name" placeholder="Your Name*" required />
                                      </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-12">
                                      <div className="form-group">
                                        <input type="email" name="your-email" placeholder="Your E-mail*" required />
                                      </div>
                                    </div>
                                    <div className="col-12">
                                      <div className="form-group">
                                        <textarea name="message" placeholder="Write your Message here*" required defaultValue={""} />
                                      </div>
                                    </div>
                                    <div className="col-12">
                                      <div className="form-check">
                                        <label className="form-check-label" htmlFor="flexCheckDefault">
                                          <input className="form-check-input" type="checkbox" defaultValue id="flexCheckDefault" />
                                          Save my name email and name and when i next time
                                          comment on this website
                                        </label>
                                      </div>
                                      <button type="submit" className="ep-btn">
                                        Send Message
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 col-xl-4 col-md-8 col-12">
                            <div className="ep-blog__sidebar">
                              <div className="ep-blog__sidebar-widget">
                                <h4 className="ep-blog__sidebar-title">Search</h4>
                                <form action="#" method="post" className="ep-blog__sidebar-search">
                                  <input type="search" name="search" placeholder="Search...." required />
                                  <button type="submit">
                                    <i className="fi-rr-search" />
                                  </button>
                                </form>
                              </div>
                              <div className="ep-blog__sidebar-widget">
                                <h4 className="ep-blog__sidebar-title">About Me</h4>
                                <div className="ep-blog__sidebar-about">
                                  <div className="ep-blog__about-img">
                                    <img src="/assets/images/blog/sidebar/about-img.png" alt="about-img" />
                                  </div>
                                  <div className="ep-blog__about-info">
                                    <h6>Stanio lainto smarle</h6>
                                    <p>
                                      Aliquam eros justo, posuere loborti viverra
                                      ullamcorper posuere
                                    </p>
                                  </div>
                                  <div className="ep-blog__about-social">
                                    <ul>
                                      <li>
                                        <a href="#">
                                          <i className="icofont-facebook" />
                                        </a>
                                      </li>
                                      <li>
                                        <a href="#">
                                          <i className="icofont-twitter" />
                                        </a>
                                      </li>
                                      <li>
                                        <a href="#">
                                          <i className="icofont-linkedin" />
                                        </a>
                                      </li>
                                      <li>
                                        <a href="#">
                                          <i className="icofont-pinterest" />
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div className="ep-blog__sidebar-widget">
                                <h4 className="ep-blog__sidebar-title">Category</h4>
                                <div className="ep-blog__sidebar-category">
                                  <ul>
                                    <li>
                                      <a href="#">Learning <span>(02)</span> </a>
                                    </li>
                                    <li>
                                      <a href="#">Einsteins Learning School <span>(05)</span>
                                      </a>
                                    </li>
                                    <li>
                                      <a href="#">Kids Preschool <span>(10)</span> </a>
                                    </li>
                                    <li>
                                      <a href="#">Learning Academy <span>(03)</span> </a>
                                    </li>
                                    <li>
                                      <a href="#">Hoppers Kinderland <span>(10)</span>
                                      </a>
                                    </li>
                                    <li>
                                      <a href="#">Sparkling Stars Preschool <span>(03)</span>
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                              <div className="ep-blog__sidebar-widget">
                                <h4 className="ep-blog__sidebar-title">Latest Blogs</h4>
                                <div className="ep-blog__latest">
                                  <div className="ep-blog__latest-item">
                                    <div className="ep-blog__latest-info">
                                      <span>
                                        <i className="fi-rr-calendar" />Jan 10,2022
                                      </span>
                                      <a href="/blog-details">Sparkling Stars the Preschool</a>
                                    </div>
                                    <div className="ep-blog__latest-img">
                                      <img src="/assets/images/blog/sidebar/latest-1.png" alt="blog-img" />
                                    </div>
                                  </div>
                                  <div className="ep-blog__latest-item">
                                    <div className="ep-blog__latest-info">
                                      <span>
                                        <i className="fi-rr-calendar" />Jan 10,2022
                                      </span>
                                      <a href="/blog-details">Explorin Elementary School main</a>
                                    </div>
                                    <div className="ep-blog__latest-img">
                                      <img src="/assets/images/blog/sidebar/latest-2.png" alt="blog-img" />
                                    </div>
                                  </div>
                                  <div className="ep-blog__latest-item">
                                    <div className="ep-blog__latest-info">
                                      <span>
                                        <i className="fi-rr-calendar" />Jan 10,2022
                                      </span>
                                      <a href="/blog-details">Discovery Kids most Preschool</a>
                                    </div>
                                    <div className="ep-blog__latest-img">
                                      <img src="/assets/images/blog/sidebar/latest-3.png" alt="blog-img" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="ep-blog__sidebar-widget">
                                <h4 className="ep-blog__sidebar-title">Archive</h4>
                                <div className="ep-blog__archive">
                                  <h6>Get On line <span>Courses</span></h6>
                                  <p>
                                    Education is a vital aspect of a child's development,
                                    and middle
                                  </p>
                                  <a href="#" className="ep-btn">Start Now <i className="fi-rs-arrow-small-right" />
                                  </a>
                                </div>
                              </div>
                              <div className="ep-blog__sidebar-widget">
                                <h4 className="ep-blog__sidebar-title">Tags</h4>
                                <div className="ep-blog__tags">
                                  <ul>
                                    <li>
                                      <a href="#">Preschool</a>
                                    </li>
                                    <li>
                                      <a href="#">Learning </a>
                                    </li>
                                    <li>
                                      <a href="#">Kids</a>
                                    </li>
                                    <li>
                                      <a href="#">Preschool</a>
                                    </li>
                                    <li>
                                      <a href="#">School</a>
                                    </li>
                                    <li>
                                      <a href="#">Academy</a>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
    </>
  );
}
