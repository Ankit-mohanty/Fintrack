# 💰 FinTracker — Personal Finance & Subscription Tracker

A full-stack **MERN** (MongoDB, Express, React, Node.js) web application for tracking personal expenses, managing subscriptions, and gaining insights into your financial habits through interactive analytics.

---

## 🚀 Features

- 🔐 **User Authentication** — Secure JWT-based registration & login
- 📧 **Forgot Password via OTP** — Email-based OTP system using Nodemailer
- 💸 **Expense Tracking** — Add, edit, delete, and categorize your expenses
- 🔁 **Subscription Management** — Track recurring subscriptions (Netflix, Spotify, etc.)
- 📊 **Analytics Dashboard** — Visual charts and summaries powered by Recharts
- 🛡️ **Security First** — Helmet, CORS, Rate Limiting, and input validation built-in
- 🎨 **Modern UI** — Responsive design with Tailwind CSS, Framer Motion animations, and React Hot Toast notifications

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Token (JWT) | Authentication |
| bcryptjs | Password hashing |
| Nodemailer | Email OTP delivery |
| Helmet + CORS | Security headers |
| express-rate-limit | API rate limiting |
| express-validator | Request validation |
| Morgan | HTTP request logging |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & bundler |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Zustand | Global state management |
| TanStack React Query | Server state & caching |
| Axios | HTTP client |
| Framer Motion | Animations & transitions |
| Recharts | Financial charts |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |
| date-fns | Date formatting |

---

## 📁 Project Structure

```
labproject/
├── backend/
│   ├── src/
│   │   ├── config/         # Database connection (MongoDB)
│   │   ├── controllers/    # Business logic handlers
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── expenseController.js
│   │   │   └── subscriptionController.js
│   │   ├── middleware/     # Auth guard & error handler
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/         # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Expense.js
│   │   │   └── Subscription.js
│   │   ├── routes/         # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   └── subscriptionRoutes.js
│   │   └── utils/          # Helper utilities
│   ├── server.js           # Express app entry point
│   ├── .env                # Environment variables (private)
│   └── .env.example        # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Application pages/views
    │   │   ├── AuthPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Expenses.jsx
    │   │   ├── Subscriptions.jsx
    │   │   ├── Analytics.jsx
    │   │   ├── Settings.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   └── ResetPassword.jsx
    │   ├── store/          # Zustand global state
    │   ├── lib/            # Axios instance & API helpers
    │   ├── utils/          # Utility functions
    │   ├── App.jsx         # Root component & router
    │   └── main.jsx        # React entry point
    ├── index.html
    └── vite.config.js
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd labproject
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file by copying the example:

```bash
copy .env.example .env
```

Fill in your environment variables in `.env`:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb://localhost:27017/fintracker

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Email (for OTP - Forgot Password)
# Enable 2FA on Gmail and generate an App Password:
# https://myaccount.google.com/apppasswords
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_here
```

Start the backend development server:

```bash
npm run dev
```

> The backend will run on **http://localhost:5000**

---

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

> The frontend will run on **http://localhost:5173**

---

## 🔌 API Endpoints

### Auth Routes — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and receive JWT |
| POST | `/forgot-password` | Send OTP to email |
| POST | `/reset-password` | Reset password using OTP |

### Expense Routes — `/api/expenses`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all expenses for current user |
| POST | `/` | Create a new expense |
| PUT | `/:id` | Update an expense |
| DELETE | `/:id` | Delete an expense |

### Subscription Routes — `/api/subscriptions`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all subscriptions |
| POST | `/` | Add a new subscription |
| PUT | `/:id` | Update a subscription |
| DELETE | `/:id` | Delete a subscription |

### Dashboard Routes — `/api/dashboard`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/summary` | Get financial summary & stats |

### Health Check
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check if the server is running |

> **Note:** All routes except `/auth/*` require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## 📸 Pages Overview

| Page | Description |
|---|---|
| **Auth Page** | Login & Register with a tabbed interface |
| **Dashboard** | Overview of total expenses, subscriptions, and recent activity |
| **Expenses** | Full CRUD management of expenses with category filters |
| **Subscriptions** | Manage recurring subscriptions with billing cycle support |
| **Analytics** | Visual charts showing spending trends and breakdowns |
| **Settings** | User profile and account preferences |
| **Forgot Password** | Request an OTP to your email for password recovery |
| **Reset Password** | Enter OTP and set a new password |

---

## 🔒 Security Features

- **HTTP Security Headers** via Helmet
- **Rate Limiting** — 200 requests per 15 minutes per IP on `/api/*`
- **Password Hashing** using bcryptjs (salt rounds)
- **JWT Authentication** with expiry
- **Input Validation** using express-validator
- **CORS** configured to only allow the frontend origin

---

## 🌱 Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/fintracker` |
| `JWT_SECRET` | Secret key for JWT signing | `mysupersecretkey` |
| `JWT_EXPIRE` | JWT token validity duration | `30d` |
| `EMAIL_SERVICE` | Email provider | `gmail` |
| `EMAIL_USER` | Sender Gmail address | `you@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | `xxxx xxxx xxxx xxxx` |

---

## 🧑‍💻 Author

**Ankit Mohanty**
B.Tech CSE — College Lab Project

---

## 📄 License

This project is for educational/lab purposes only.
```
