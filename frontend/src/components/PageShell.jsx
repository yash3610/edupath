import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

function routeFromHref(href) {
  if (!href || href === "#") return null;
  if (href === "/") return "/";
  if (href.startsWith("/") && !href.startsWith("/assets/")) return href;
  return null;
}

function getFormKind(form) {
  if (form.closest(".ep-contact__form")) return "contact";
  if (form.classList.contains("ep-footer__newsletter")) return "newsletter";
  if (form.closest(".auth-login")) return "login";
  if (form.closest(".auth-register")) return "register";
  if (form.closest(".ep-checkout")) return "order";
  return "generic";
}

function payloadFromForm(form) {
  const data = new FormData(form);
  return {
    name: data.get("your-name") || data.get("name") || "",
    email: data.get("your-email") || data.get("email") || "",
    phone: data.get("your-number") || data.get("phone") || "",
    message: data.get("message") || "",
    subject: data.get("subject") || "",
  };
}

function orderPayloadFromPage(form) {
  const data = new FormData(form);
  const firstName = data.get("first-name") || data.get("fname") || data.get("name") || "";
  const lastName = data.get("last-name") || data.get("lname") || "";
  const address = data.get("address") || data.get("street-address") || data.get("city") || "Checkout order";

  return {
    customerName: `${firstName} ${lastName}`.trim() || data.get("your-name") || "Customer",
    email: data.get("email") || data.get("your-email") || "customer@example.com",
    phone: data.get("phone") || data.get("your-number") || "",
    address,
    items: [
      {
        title: "Edupath checkout item",
        quantity: 1,
        price: 20,
      },
    ],
  };
}

function payloadForKind(kind, form) {
  const data = new FormData(form);

  if (kind === "login") {
    return {
      email: data.get("email") || "",
      password: data.get("password") || "",
    };
  }

  if (kind === "register") {
    return {
      name: data.get("name") || data.get("full-name") || data.get("username") || "Edupath User",
      email: data.get("email") || "",
      password: data.get("password") || "",
    };
  }

  if (kind === "order") return orderPayloadFromPage(form);
  return payloadFromForm(form);
}

function endpointForKind(kind) {
  const endpoints = {
    contact: api.contact,
    newsletter: api.newsletter,
    login: api.login,
    register: api.register,
    order: api.order,
  };

  return endpoints[kind];
}

function setText(element, value) {
  if (element && value) element.textContent = value;
}

function setImage(element, value) {
  if (element && value) {
    element.src = value;
    element.alt = element.alt || "";
  }
}

function hydrateCourses(courses = []) {
  const cards = document.querySelectorAll(".ep-course__card, .ep-course__slider-item");
  cards.forEach((card, index) => {
    const course = courses[index % courses.length];
    if (!course) return;

    setText(card.querySelector(".ep-course__title h5, .ep-course__title h3, .ep-course__title"), course.title);
    setText(card.querySelector(".ep-course__price"), course.price ? `$${course.price}` : "");
    setText(card.querySelector(".ep-course__text, p"), course.description);
    setImage(card.querySelector(".ep-course__img img"), course.image);
  });
}

function hydrateBlogs(blogs = []) {
  const cards = document.querySelectorAll(".ep-blog__card");
  cards.forEach((card, index) => {
    const blog = blogs[index % blogs.length];
    if (!blog) return;

    setText(card.querySelector(".ep-blog__title h5, .ep-blog__title, h5"), blog.title);
    setText(card.querySelector(".ep-blog__text, p"), blog.excerpt);
    setImage(card.querySelector(".ep-blog__img img"), blog.image);
  });
}

function hydrateEvents(events = []) {
  const cards = document.querySelectorAll(".ep-event__card");
  cards.forEach((card, index) => {
    const event = events[index % events.length];
    if (!event) return;

    setText(card.querySelector(".ep-event__title"), event.title);
    setText(card.querySelector(".ep-event__location span, .ep-event__location"), event.location);
    setImage(card.querySelector(".ep-event__img img"), event.image);
  });
}

function hydrateProducts(products = []) {
  const cards = document.querySelectorAll(".ep-product__card, .ep-shop__card");
  cards.forEach((card, index) => {
    const product = products[index % products.length];
    if (!product) return;

    setText(card.querySelector(".ep-product__title, h5, h4"), product.title);
    setText(card.querySelector(".ep-product__price, .price"), product.price ? `$${product.price}` : "");
    setImage(card.querySelector("img"), product.image);
  });
}

function hydrateTeam(team = []) {
  const cards = document.querySelectorAll(".ep-team__card");
  cards.forEach((card, index) => {
    const member = team[index % team.length];
    if (!member) return;

    setText(card.querySelector(".ep-team__author h5, h5"), member.name);
    setText(card.querySelector(".ep-team__author p, p"), member.role);
    setImage(card.querySelector(".ep-team__img img"), member.image);
  });
}

export default function PageShell({ title, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;

    async function hydrateFromBackend() {
      try {
        const tasks = [];

        if (location.pathname === "/" || location.pathname.includes("course")) tasks.push(api.courses());
        if (location.pathname === "/" || location.pathname.includes("blog")) tasks.push(api.blogs());
        if (location.pathname === "/" || location.pathname.includes("event")) tasks.push(api.events());
        if (location.pathname === "/" || location.pathname.includes("shop")) tasks.push(api.products());
        if (location.pathname === "/" || location.pathname.includes("team")) tasks.push(api.team());

        const results = await Promise.allSettled(tasks);
        if (!active) return;

        results.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const data = result.value.data || [];
          const first = data[0] || {};

          if ("instructor" in first || "rating" in first) hydrateCourses(data);
          if ("publishedAt" in first || "excerpt" in first) hydrateBlogs(data);
          if ("eventDate" in first || "location" in first) hydrateEvents(data);
          if ("stock" in first || "oldPrice" in first) hydrateProducts(data);
          if ("role" in first || "bio" in first) hydrateTeam(data);
        });
      } catch {
        // Static JSX remains usable even if backend is offline.
      }
    }

    window.setTimeout(hydrateFromBackend, 0);

    return () => {
      active = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    document.title = title || "Edupath - Education, Course & Online Learning";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [title]);

  useEffect(() => {
    const onScroll = () => {
      document
        .querySelectorAll(".ep-header__middle")
        .forEach((header) => header.classList.toggle("sticky", window.scrollY >= 100));
    };

    const closeMobileMenu = () => {
      document.querySelector("#offcanvas-modal")?.classList.remove("show");
      document.querySelector(".modal-backdrop-react")?.remove();
      document.body.classList.remove("modal-open");
    };

    const onClick = (event) => {
      if (event.defaultPrevented) return;

      const mobileButton = event.target.closest(".mobile-menu-offcanvas-toggler");
      if (mobileButton) {
        event.preventDefault();
        document.querySelector("#offcanvas-modal")?.classList.add("show");
        if (!document.querySelector(".modal-backdrop-react")) {
          document.body.insertAdjacentHTML("beforeend", '<div class="modal-backdrop-react"></div>');
        }
        document.body.classList.add("modal-open");
        return;
      }

      if (event.target.closest(".btn-close, .modal-backdrop-react")) {
        event.preventDefault();
        closeMobileMenu();
        return;
      }

      const submenuToggle = event.target.closest("#offcanvas-menu .menu-arrow");
      if (submenuToggle) {
        event.preventDefault();
        submenuToggle.parentElement?.classList.toggle("active");
        return;
      }

      const backTop = event.target.closest(".progress-wrap");
      if (backTop) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const passwordToggle = event.target.closest("[data-password-toggle]");
      if (passwordToggle) {
        event.preventDefault();
        const input = document.getElementById(passwordToggle.getAttribute("data-password-toggle"));
        if (input) {
          input.type = input.type === "password" ? "text" : "password";
          passwordToggle.textContent = input.type === "password" ? "Show" : "Hide";
        }
        return;
      }

      const link = event.target.closest("a");
      const route = routeFromHref(link?.getAttribute("href"));
      if (route) {
        event.preventDefault();
        closeMobileMenu();
        navigate(route);
      }
    };

    const onSubmit = async (event) => {
      if (event.defaultPrevented) return;
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      const kind = getFormKind(form);
      if (kind === "generic") {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      const submit = endpointForKind(kind);
      const status = document.createElement("p");
      status.className = "app-form-status";
      status.textContent = "Sending...";
      form.querySelector(".app-form-status")?.remove();
      form.appendChild(status);

      try {
        const result = await submit(payloadForKind(kind, form));
        if (kind === "login" || kind === "register") {
          localStorage.setItem("edupath_session", JSON.stringify(result.data));
        }
        status.className = "app-form-status success";
        status.textContent = result.message || "Submitted successfully.";
        form.reset();
      } catch (error) {
        status.className = "app-form-status error";
        status.textContent = error.message || "Something went wrong.";
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
      closeMobileMenu();
    };
  }, [navigate]);

  return <>{children}</>;
}
