import React from "react";

export default function BlogCard({ blog }) {
  return (
    <a href="/blog-details" className="ep-blog__card">
      <div className="ep-blog__img">
        <img src={blog.image} alt={blog.title} />
      </div>
      <div className="ep-blog__content">
        <span>{blog.author}</span>
        <h5>{blog.title}</h5>
        <p>{blog.excerpt}</p>
      </div>
    </a>
  );
}
