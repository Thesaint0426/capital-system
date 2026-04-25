# CAPITAL SYSTEM
### Private Investment Management Platform

A full-stack web application for managing private investment cycles, built with Next.js, Node.js, Express, and PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (React) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens) |
| Styling | Custom CSS (dark fintech theme) |
| Charts | Chart.js + react-chartjs-2 |

---

## Project Structure

```
capital-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL pool
│   │   │   └── schema.sql        # DB schema + auto-init
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT middleware + admin guard
│   │   ├── routes/
│   │   │   ├── auth.js           # /api/auth/*
│   │   │   ├── investor.js       # /api/investor/*
│   │   │   └── admin.js          # /api/admin/*
│   │   └── index.js              # Express entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── pages/
│   │   ├── index.js              # Redirect router
│   │   ├── login.js              # Login page
│   │   ├── register.js           # Registration page
│   │   ├── investor/
│   │   │   ├── dashboard.js      # Main investor dashboard
│   │   │   ├── cycles.js         # Investment cycles history
│   │   │   └── withdraw.js       # Withdrawal request page
│   │   └── admin/
│   │       ├── index.js          # Admin overview
│   │       ├── users.js          # Manage investors + create accounts
│   │       ├── cycles.js         # Start/close cycles
│   │       └── withdrawals.js    # Approve/reject withdrawals
│   ├── components/
│   │   └── Sidebar.js            # Navigation sidebar
│   ├── lib/
│   │   ├── api.js                # Axios instance with JWT interceptor
│   │   ├── auth.js               # Auth context, hooks, HOC
│   │   └── format.js             # Currency, date, status formatters
│   ├── styles/
│   │   └── globals.css           # Full design system
│   ├── .env.local.example
│   └── package.json
│
└── README.md
```

---

## Quick Start

### 1. Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+ running locally
- **npm** or **yarn**

### 2. Create the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE capital_system;
\q
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/capital_system
JWT_SECRET=change_this_to_a_long_random_string_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### 4. Configure Frontend

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 6. Start the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

The backend will start and automatically run the schema SQL to create all tables.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Access the App

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend (auto-redirects) |
| http://localhost:3000/login | Login page |
| http://localhost:3000/register | Register page |
| http://localhost:5000/health | Backend health check |

---

## Default Admin Account

The schema creates a default admin automatically:

| Field | Value |
|-------|-------|
| Email | `admin@capital.com` |
| Password | `password` |

> ⚠️ **Change this password immediately in production.**

To create an admin with a real password, register a normal user then manually update their role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## User Flow

### Investor Flow
1. Investor registers at `/register`
2. Admin activates their account at **Admin → Investors → Create Account** (sets initial deposit)
3. Admin starts a 30-day cycle at **Admin → Cycles → Start New Cycle**
4. Investor monitors progress at `/investor/dashboard`
5. After 30 days, admin closes the cycle and inputs result
6. Investor balance updates automatically
7. Investor may submit withdrawal request at `/investor/withdraw`
8. Admin approves/rejects at **Admin → Withdrawals**

### Admin Flow
1. Login with admin credentials
2. View system overview at `/admin`
3. Manage investors at `/admin/users`
4. Manage cycles at `/admin/cycles`
5. Process withdrawals at `/admin/withdrawals`

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Investor (requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/investor/account` | Get account + balance |
| GET | `/api/investor/cycles` | Get all cycles |
| GET | `/api/investor/withdrawals` | Get withdrawal history |
| POST | `/api/investor/withdraw` | Submit withdrawal request |

### Admin (requires JWT + admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all investors |
| POST | `/api/admin/account` | Create investor account |
| GET | `/api/admin/cycles` | List all cycles |
| POST | `/api/admin/cycle` | Start new cycle |
| POST | `/api/admin/close-cycle` | Close cycle with result |
| GET | `/api/admin/withdrawals` | List all withdrawals |
| POST | `/api/admin/withdrawal/:id/approve` | Approve withdrawal |
| POST | `/api/admin/withdrawal/:id/reject` | Reject withdrawal |

---

## Database Schema

```sql
users           — id, name, email, password_hash, role, created_at
accounts        — id, user_id, initial_deposit, current_balance
investment_cycles — id, user_id, amount, start_date, end_date, status, result_amount, profit_loss
withdrawals     — id, user_id, amount, fee, net_amount, status, requested_at, processed_at
```

---

## Business Logic

### Cycle Closing
When admin closes a cycle with a result amount:
- `profit_loss = result_amount - amount`
- `new_balance = old_balance - cycle_amount + result_amount`
- Cycle status → `completed`

### Withdrawal
- Fee = 0.5% of requested amount
- Net payout = amount − fee
- On approval: balance is deducted, status → `approved`
- Blocked if: active cycle exists OR pending withdrawal exists

---

## Security

- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT tokens expire in 7 days
- All investor routes require valid JWT
- All admin routes require JWT + `role = 'admin'`
- Input validation on all endpoints via express-validator
- SQL injection protection via parameterized queries (pg library)

---

## Production Checklist

- [ ] Change default admin password
- [ ] Set a strong `JWT_SECRET` (32+ random characters)
- [ ] Use `NODE_ENV=production`
- [ ] Enable SSL for PostgreSQL connection
- [ ] Set up HTTPS on both frontend and backend
- [ ] Configure proper CORS origin for your domain
- [ ] Set up database backups
- [ ] Use environment variables (never commit `.env`)
