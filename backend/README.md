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

Development staff accounts can be seeded automatically:

```env
SEED_DATABASE=true
SEED_ADMIN_EMAIL=admin@edupath.com
SEED_ADMIN_PASSWORD=use-a-strong-password
SEED_INSTRUCTOR_EMAIL=instructor@edupath.com
SEED_INSTRUCTOR_PASSWORD=use-another-strong-password
```

Start the backend once after setting these values. Missing accounts are created without duplicating existing users.

To seed without starting the API server:

```bash
npm run seed
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

## Live Class Module

The integrated live class workflow supports admin approval, instructor scheduling, student join windows, attendance, recordings, resources, Q&A, notifications, email reminders, and CSV attendance export.

Recommended environment variables:

```env
# Run reminder sweeps every minute.
ENABLE_JOBS=true

# false = instructor classes require admin approval.
LIVE_CLASS_AUTO_APPROVE=false

# Used for recording/resource uploads.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Used for approval, schedule, cancellation, and reminder email.
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM="EduPath <no-reply@example.com>"
```

Main routes:

```txt
Admin:      /api/admin/live-classes
Instructor: /api/instructor/live-classes
Student:    /api/student/live-classes
```

Example instructor schedule request:

```bash
curl -X POST http://localhost:5000/api/instructor/live-classes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"React Q&A\",\"course\":\"COURSE_ID\",\"startAt\":\"2026-06-12T12:30:00.000Z\",\"duration\":60,\"meetingPlatform\":\"google-meet\",\"meetingLink\":\"https://meet.google.com/example\"}"
```

Example admin approval:

```bash
curl -X PATCH http://localhost:5000/api/admin/live-classes/LIVE_CLASS_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Example student join:

```bash
curl -X POST http://localhost:5000/api/student/live-classes/LIVE_CLASS_ID/join \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

Zoom and Google Meet are currently external meeting links. Their native attendance/webhook APIs require separate provider OAuth credentials. The `built-in` option stores the session as an LMS-hosted type, but a WebRTC/SFU provider such as LiveKit, Agora, or Twilio must be connected for embedded video.

## Security
Helmet, CORS, rate limiting, Mongo sanitize, XSS clean, JWT middleware, role middleware and file validation are wired in `src/middleware`.
## Dashboard database setup

The current application uses the `backend/src` API and MongoDB models as the canonical backend for all three dashboards.

```bash
npm run db:reset
npm run dev
```

`db:reset` drops the configured MongoDB database, recreates indexes, and seeds connected Admin, Instructor, and Student demo data. Configure all seed credentials in `.env`; the student seed variables are documented in `.env.example`.

Dashboard roots:

- Student: `/dashboard`
- Instructor: `/instructor/dashboard`
- Admin: `/admin/dashboard`

The frontend mock exports are also stored unchanged in the `dashboarddatasets` collection. Each record keeps its inferred field/type format. New items and replacements can be validated through:

- `GET /api/dashboard-data/:role`
- `GET /api/dashboard-data/:role/:key`
- `POST /api/dashboard-data/:role/:key/items`
- `PUT /api/dashboard-data/:role/:key`
