# EduPath LMS Backend

Production-ready Express/Mongo API scaffold for the EduPath MERN LMS.

## Stack
Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Multer, Cloudinary, Razorpay, Nodemailer, PDFKit, AI service placeholders and ML analytics service.

## Setup
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

MongoDB must be running for database-backed APIs:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/edupath
JWT_SECRET=use-a-long-random-secret-at-least-32-chars
JWT_REFRESH_SECRET=use-another-long-random-secret
```

## Folder Structure
```txt
src/
  app.js
  server.js
  config/
  controllers/
  middleware/
  models/
  routes/
  seed/
  services/
  utils/
  validators/
```

## Main API Groups
- `/api/auth`
- `/api/student`
- `/api/learning`
- `/api/notes`
- `/api/quizzes`
- `/api/assignments`
- `/api/certificates`
- `/api/wishlist`
- `/api/calendar`
- `/api/notifications`
- `/api/messages`
- `/api/orders`
- `/api/profile`
- `/api/settings`
- `/api/ai`
- `/api/ml`
- `/api/community`
- `/api/payments`
- `/api/enrollments`
- `/api/instructor`
- `/api/admin`

## Security
Helmet, CORS, rate limiting, Mongo sanitize, XSS clean, JWT middleware, role middleware and file validation are wired in `src/middleware`.
