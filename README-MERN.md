# Edupath MERN Conversion

This project now has two runnable folders:

- `frontend` - React + Vite + Tailwind-ready frontend
- `backend` - Node.js + Express + MongoDB/Mongoose API

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Run Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend runs at `http://localhost:5000`.

Update `backend/.env` if your MongoDB URI is different.

## APIs

- `GET /api/health`
- `POST /api/contact`
- `POST /api/newsletter`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/courses`
- `GET /api/courses/:slug`
- `GET /api/blogs`
- `GET /api/blogs/:slug`
- `GET /api/events`
- `GET /api/events/:slug`
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/team`
- `GET /api/team/:slug`
- `GET /api/orders`
- `POST /api/orders`

## Notes

The HTML pages are converted into real JSX React pages under `frontend/src/pages`. The original template CSS/assets are preserved to keep the UI visually identical and responsive, while jQuery scripts are no longer loaded. React handles routing, mobile menu, sticky header, back-to-top, password toggle, and form submissions.

`faq.html`, `service.html`, `portfolio.html`, and `testimonial.html` in the original source were Vercel 404 dump pages, not real Edupath template pages. They are present as React pages, but they cannot contain Edupath UI content unless real source HTML is provided.
