# CAPITAL SYSTEM — ADMIN HANDBOOK
### Complete Operations Guide for Administrators

---

## TABLE OF CONTENTS
1. [First Login & Setup](#1-first-login--setup)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Managing Investors](#3-managing-investors)
4. [Investment Cycles](#4-investment-cycles)
5. [Withdrawals](#5-withdrawals)
6. [Business Rules & Logic](#6-business-rules--logic)
7. [Deployment Guide (Railway)](#7-deployment-guide-railway)
8. [Security Checklist](#8-security-checklist)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. FIRST LOGIN & SETUP

### Default Admin Credentials
| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@capital.com`    |
| Password | `Admin@12345`          |

> ⚠️ **CHANGE THIS PASSWORD IMMEDIATELY after first login.**
> Do this by registering a new account, then updating the role in the database.

### First-Time Checklist
- [ ] Log in with default admin credentials
- [ ] Verify the dashboard loads correctly
- [ ] Create your real admin account (register → update role via DB)
- [ ] Delete or deactivate the default admin account
- [ ] Test by registering one investor account

---

## 2. DASHBOARD OVERVIEW

When you log in as admin, you land on **Admin → Overview** which shows:

| Metric | What It Means |
|--------|---------------|
| **Total AUM** | Sum of all investor current balances |
| **Total Profit Paid** | Sum of all profit/loss across all closed cycles |
| **Active Investors** | Number of investors with activated accounts |
| **Active Cycles** | How many cycles are currently running |
| **Pending Withdrawals** | How many withdrawal requests need your action |
| **Total Cycles** | All cycles ever run (active + completed) |

---

## 3. MANAGING INVESTORS

### Step 1 — Investor Registers
The investor goes to `/register` and creates an account with their name, email, and password. This creates a **user record only** — no money account yet.

### Step 2 — You Activate Their Account
1. Go to **Admin → Investors**
2. Find the investor in the list (they'll show "No account" in balance column)
3. Click **Create Account**
4. Enter their **initial deposit** — this is the cash amount they gave you **offline**
5. Click **Create Account**

Their account is now active:
- `initial_deposit` = what you entered
- `current_balance` = same as initial deposit (starting point)

### Step 3 — Viewing Investor Details
The investors table shows:
- **Name & Email**
- **Initial Deposit** — what they originally put in
- **Current Balance** — live balance after cycles and withdrawals
- **P/L** — total profit or loss since joining
- **Active Cycle** — yes/no indicator
- **Pending W/D** — pending withdrawal count

> 💡 You can have as many investors as you want. Each investor is independent.

---

## 4. INVESTMENT CYCLES

### The 30-Day Cycle Model
Each cycle represents one investment round. The flow is:
```
Admin starts cycle → 30 days pass → Admin closes cycle with result → Balance updates
```

### Starting a Cycle

1. Go to **Admin → Cycles** → click **+ Start New Cycle**
2. Select the investor from the dropdown
3. Enter the **cycle amount** (the portion of their balance being invested)
4. Optionally add a **note** (e.g. "Q2 2025 round")
5. Click **Start Cycle**

**Rules the system enforces:**
- Investor cannot have 2 active cycles at the same time
- Cycle amount cannot exceed investor's current balance
- Investor must have an account (activated) first

**What happens in the database:**
- A new `investment_cycles` row is created with `status = 'active'`
- `start_date` = today
- `end_date` = today + 30 days

### Monitoring Active Cycles
The **Admin → Cycles** page shows all active cycles at the top with:
- Investor name
- Amount in cycle
- Days remaining
- Visual progress bar

### Closing a Cycle

When the 30 days are up (or whenever you're ready):

1. Go to **Admin → Cycles**
2. Find the active cycle → click **Close Cycle**
3. Enter the **result amount** — this is what the investment returned
4. Optionally add admin notes for the investor
5. Click **Close & Record Result**

**Result amount examples:**
| Invested | Result | Outcome |
|----------|--------|---------|
| $10,000 | $10,850 | +$850 profit (+8.5%) |
| $10,000 | $10,000 | Break even |
| $10,000 | $9,600 | -$400 loss (-4%) |

**What happens automatically:**
- Cycle status → `completed`
- `profit_loss` = result_amount − amount
- Investor's `current_balance` is updated:
  - Old balance minus the cycle amount, plus the result amount
  - Example: balance was $10,000, cycle was $10,000, result $10,850 → new balance = $10,850

### Cycle History
All past cycles are visible in the table with:
- Status (active/completed)
- Amount invested
- Result amount
- Profit/Loss (green = profit, red = loss)
- Start and end dates

---

## 5. WITHDRAWALS

### How Investors Request Withdrawals
Investors go to **My Account → Withdraw** and enter an amount. The system:
- Shows the 0.5% fee automatically
- Shows the net amount they'll receive
- Blocks the request if they have an active cycle
- Blocks if they already have a pending withdrawal

### Processing Withdrawals

1. Go to **Admin → Withdrawals**
2. Pending requests appear at the top with yellow highlight
3. For each request you see:
   - Investor name & email
   - Gross amount requested
   - Fee (0.5%) — automatically calculated
   - Net payout (what you actually send them)
4. Click **Approve** or **Reject**

**When you APPROVE:**
- The gross amount is deducted from the investor's balance immediately
- You then pay them the net amount **offline** (bank transfer, cash, etc.)
- You can add an admin note (e.g. "Paid via bank transfer on 15 Apr")

**When you REJECT:**
- Nothing changes to the balance
- You should add a note explaining why (e.g. "Active cycle in progress")

### Fee Calculation
```
Fee = Requested Amount × 0.5%
Net Payout = Requested Amount − Fee

Example: $1,000 withdrawal
  Fee = $1,000 × 0.005 = $5.00
  Net = $1,000 − $5.00 = $995.00
```

---

## 6. BUSINESS RULES & LOGIC

### Balance Calculation
```
Current Balance = Initial Deposit
                + Sum of all (result_amount - amount) from completed cycles
                - Sum of all approved withdrawal amounts
```

### Rules Summary Table
| Situation | Rule |
|-----------|------|
| Investor has active cycle | Cannot request withdrawal |
| Investor has pending withdrawal | Cannot request another withdrawal |
| Cycle amount > balance | Admin cannot start cycle |
| Two cycles at once | Not allowed per investor |
| Withdrawal fee | Always 0.5%, non-negotiable |
| Cycle duration | Always 30 days from start date |

### What Admins Can and Cannot Do
| Action | Admin Can Do |
|--------|-------------|
| Create investor account | ✅ Yes |
| Change initial deposit after creation | ❌ No (directly — only via DB) |
| Start cycle | ✅ Yes |
| Close cycle early | ✅ Yes (any time) |
| Input any result amount | ✅ Yes |
| Approve/reject withdrawals | ✅ Yes |
| Delete users | ❌ No (frontend) — only via DB |

---

## 7. DEPLOYMENT GUIDE (RAILWAY)

Railway is the easiest free platform for this stack.

### Prerequisites
- GitHub account (free)
- Railway account (free at railway.app)
- Your `capital-system.zip` downloaded and unzipped

### Step 1 — Push to GitHub
```bash
# In your capital-system folder
git init
git add .
git commit -m "Capital System v1.0"
```
Create a new repo at github.com, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/capital-system.git
git push -u origin main
```

### Step 2 — Create Railway Project
1. Go to [railway.app](https://railway.app) → **Start a New Project**
2. Choose **Deploy from GitHub repo**
3. Select your `capital-system` repository

### Step 3 — Add PostgreSQL Database
1. In your Railway project, click **+ New** → **Database** → **PostgreSQL**
2. Click the PostgreSQL service → **Connect** tab
3. Copy the `DATABASE_URL` value (looks like `postgresql://postgres:xxx@xxx.railway.app:5432/railway`)

### Step 4 — Configure Backend Service
Railway will create a service from your repo. Configure it:

**Settings → General:**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node src/index.js`

**Settings → Variables (add these):**
```
PORT=4000
DATABASE_URL=<paste your Railway PostgreSQL URL>
JWT_SECRET=<generate 50 random chars — use: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://<your-frontend-domain>.railway.app
NODE_ENV=production
```

### Step 5 — Configure Frontend Service
Click **+ New Service** → **GitHub Repo** → same repo again

**Settings → General:**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Settings → Variables:**
```
NEXT_PUBLIC_API_URL=https://<your-backend-domain>.railway.app
PORT=3000
```

### Step 6 — Get Your URLs
Railway gives each service a URL like:
- Backend: `https://capital-backend-production.up.railway.app`
- Frontend: `https://capital-frontend-production.up.railway.app`

Update each service's `FRONTEND_URL` / `NEXT_PUBLIC_API_URL` to point to the other.

### Step 7 — First Login on Production
1. Go to your frontend Railway URL
2. Login: `admin@capital.com` / `Admin@12345`
3. **Immediately change the admin password** (register a new account, update role via Railway's PostgreSQL console)

### Update Admin Role via Railway DB Console
In Railway → PostgreSQL service → **Query** tab:
```sql
-- Promote your new account to admin
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';

-- Optionally remove default admin
DELETE FROM users WHERE email = 'admin@capital.com';
```

---

## 8. SECURITY CHECKLIST

### Before Going Live
- [ ] Change `JWT_SECRET` to 50+ random characters
- [ ] Delete or change the default `admin@capital.com` account
- [ ] Use HTTPS on both frontend and backend (Railway handles this automatically)
- [ ] Set `NODE_ENV=production`
- [ ] Never share your `.env` file or commit it to GitHub

### Ongoing
- [ ] Review withdrawal requests promptly
- [ ] Keep cycle records up to date
- [ ] Regularly backup the PostgreSQL database (Railway has automatic backups on paid plan)

### Password Requirements
Investors must use passwords of at least 6 characters. For production, consider:
- Increasing this to 8+ characters (in `backend/src/routes/auth.js`, change `.isLength({ min: 6 })`)

---

## 9. TROUBLESHOOTING

### "Account not found" on investor dashboard
**Cause:** Admin hasn't created the account yet
**Fix:** Go to Admin → Investors → Create Account for that user

### "Cannot withdraw while a cycle is active"
**Cause:** Investor has a running cycle
**Fix:** Close the cycle first, then the investor can withdraw

### "User already has an active investment cycle"
**Cause:** Trying to start a second cycle for the same investor
**Fix:** Close the existing active cycle first

### "Insufficient account balance for this cycle"
**Cause:** Cycle amount is greater than investor's current balance
**Fix:** Enter an amount equal to or less than the investor's balance

### Investor can't log in
**Possible causes:**
- Wrong password → ask them to check carefully (case-sensitive)
- Email not registered → ask them to register at `/register`

### Balance looks wrong
Check this in order:
1. Admin → Investors — see current balance
2. Admin → Cycles — verify all cycles are properly closed with correct result amounts
3. Admin → Withdrawals — verify all approved withdrawals are accounted for

### Backend won't start (local development)
```bash
# Check PostgreSQL is running
pg_isready

# Check the .env file has the right DATABASE_URL
cat backend/.env

# Check for port conflicts (use 4000 or 3001)
lsof -i :4000
```

### Frontend won't connect to backend
Check `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```
Make sure this matches the PORT in `backend/.env`.

---

## QUICK REFERENCE CARD

### Daily Admin Workflow
```
1. Check Overview → any pending withdrawals?
2. Check Cycles → any cycles near their end date?
3. Process pending withdrawals → Approve or Reject
4. Close mature cycles → enter result amounts
5. Start new cycles for investors ready for a new round
```

### URLs
| Page | Path |
|------|------|
| Login | `/login` |
| Admin Overview | `/admin` |
| Manage Investors | `/admin/users` |
| Manage Cycles | `/admin/cycles` |
| Manage Withdrawals | `/admin/withdrawals` |
| Investor Dashboard | `/investor/dashboard` |
| Investor Cycles | `/investor/cycles` |
| Investor Withdraw | `/investor/withdraw` |

### API Endpoints Quick Reference
```
POST /api/auth/login              Login
POST /api/auth/register           Register
GET  /api/admin/users             List investors
POST /api/admin/account           Create investor account
POST /api/admin/cycle             Start cycle
POST /api/admin/close-cycle       Close cycle + record result
GET  /api/admin/withdrawals       List withdrawals
POST /api/admin/withdrawal/:id/approve   Approve
POST /api/admin/withdrawal/:id/reject    Reject
```

---

*Capital System v1.0 — Built with Next.js, Node.js, Express, PostgreSQL*
