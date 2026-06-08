import React from "react";
import useApiResource from "../../hooks/useApiResource.js";
import { fallbackBlogs } from "../../data/homeData.js";

export default function BlogSection() {
  const { data } = useApiResource("blogs");
  const blogs = data.length ? data : fallbackBlogs;

  return (
    <section className="ep-blog section-gap pt-0 position-relative">
      <div className="container ep-container">
        <div className="row">
          <div className="col-12">
            <div className="ep-section-head ep-section-head--style2">
              <h3 className="ep-section-head__color-title ep1-color ep1-border-color">9.OUR BLOGS</h3>
              <h2 className="ep-section-head__big-title ep-split-text left">Dive into Our Education <br />Insights Latest Blog Posts</h2>
            </div>
          </div>
        </div>
        <div className="row">
          {blogs.slice(0, 3).map((blog) => (
            <div className="col-lg-6 col-xl-4 col-md-6 col-12" key={blog.slug || blog.title}>
              <div className="ep-blog__card ep-blog__card--style2 wow fadeInUp">
                <a href="/blog-details" className="ep-blog__img"><img src={blog.image} alt="blog-img" /></a>
                <div className="ep-blog__info">
                  <div className="ep-blog__date">22 jan</div>
                  <div className="ep-blog__content">
                    <div className="ep-blog__meta">
                      <ul>
                        <li><i className="fi-rr-comments" />Comments (05)</li>
                        <li><a href="#"><i className="fi-rr-user" />By admin</a></li>
                      </ul>
                    </div>
                    <a href="/blog-details" className="ep-blog__title"><h5 className="m-0">{blog.title}</h5></a>
                    <div className="ep-blog__btn"><a href="/blog-details">Read More <i className="fi fi-rs-arrow-small-right" /></a></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
