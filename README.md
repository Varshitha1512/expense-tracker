# 💸 Spendly — MERN Expense Tracker

A full-stack expense tracker built with MongoDB, Express, React, and Node.js.

## Features
- JWT Authentication (register/login)
- Add, edit, delete transactions (income & expense)
- Filter by type, category, date range — with pagination
- Category management with icons, colors & budgets
- Dashboard with monthly summary cards
- Bar chart: 6-month income vs expense trend
- Pie chart: spending by category
- Dark theme UI

---

## Project Structure
```
expense-tracker/
├── backend/       → Express + MongoDB API
└── frontend/      → React + Vite app
```

---

## Setup Instructions

### 1. MongoDB
Make sure MongoDB is running locally:
```bash
mongod
```
Or use a free [MongoDB Atlas](https://cloud.mongodb.com) cluster and paste the URI in `.env`.

---

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env     # or edit .env directly
npm run dev              # runs on http://localhost:5000
```

`.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_secret_key_here
```

---

### 3. Frontend
```bash
cd frontend
npm install
npm run dev              # runs on http://localhost:5173
```

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |
| PUT  | /api/auth/profile | Update profile |

### Transactions
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/transactions | List (filters: type, category, startDate, endDate, page, limit) |
| POST | /api/transactions | Create |
| PUT | /api/transactions/:id | Update |
| DELETE | /api/transactions/:id | Delete |

### Categories
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/categories | List user's categories |
| POST | /api/categories | Create |
| PUT | /api/categories/:id | Update |
| DELETE | /api/categories/:id | Delete |

### Stats
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/stats/summary | Monthly income/expense/balance |
| GET | /api/stats/by-category | Expense breakdown by category |
| GET | /api/stats/monthly-trend | Last 6 months bar chart data |

---

## Tech Stack
- **MongoDB** — database
- **Express.js** — REST API
- **React 18** — frontend (Vite)
- **Node.js** — runtime
- **JWT** — authentication
- **Recharts** — charts
- **react-hot-toast** — notifications
