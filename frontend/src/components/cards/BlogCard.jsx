import React from "react";
import { Link } from "react-router-dom";

export default function BlogCard({ blog }) {
  return (
    <Link to={`/blog/${blog.slug}`} className="ep-blog__card">
      <div className="ep-blog__img">
        <img src={blog.image} alt={blog.title} />
      </div>
      <div className="ep-blog__content">
        <span>{blog.author}</span>
        <h5>{blog.title}</h5>
        <p>{blog.excerpt}</p>
      </div>
    </Link>
  );
}
