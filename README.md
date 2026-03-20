# Golf Charity Subscription Platform

> **Stack:** MERN (MongoDB + Express + React + Node.js)  
> **Built for:** Digital Heroes — Full-Stack Trainee Selection Process

---

## Project Structure

```
golf-platform/
├── backend/          # Node.js + Express API
└── frontend/         # React + Vite + Tailwind CSS
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in all environment variables (see below)
npm run seed          # Seeds admin user + 5 charities
npm run dev           # Runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev           # Runs on http://localhost:5173
```

---

## Environment Variables

### Backend `.env`

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Any random secret (32+ chars recommended) |
| `JWT_EXPIRE` | Token expiry e.g. `7d` |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe Price ID for monthly plan |
| `STRIPE_YEARLY_PRICE_ID` | Stripe Price ID for yearly plan |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_HOST` | SMTP host e.g. `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port e.g. `587` |
| `EMAIL_USER` | Your email address |
| `EMAIL_PASS` | App password (not your real password) |
| `EMAIL_FROM` | Sender name + email |
| `CLIENT_URL` | Frontend URL e.g. `http://localhost:5173` |

### Frontend `.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL e.g. `http://localhost:5000/api` |

---

## Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create two Products + Prices in the Dashboard:
   - **Monthly**: £19.99/month recurring → copy Price ID to `STRIPE_MONTHLY_PRICE_ID`
   - **Yearly**: £199/year recurring → copy Price ID to `STRIPE_YEARLY_PRICE_ID`
3. Enable the Stripe Customer Portal in Dashboard → Settings → Customer Portal
4. Set up a webhook endpoint pointing to `https://your-api/api/payments/webhook`:
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`
   - Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

---

## Test Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@golfcharity.com` | `Admin@123` |

For Stripe test payments use card `4242 4242 4242 4242`, any future expiry, any CVC.

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ to Vercel — vercel.json handles SPA routing
# Set VITE_API_URL env var to your Render backend URL
```

### Backend → Render

1. Connect your GitHub repo in [Render dashboard](https://render.com)
2. Use `render.yaml` for auto-configuration
3. Set all environment variables in Render dashboard
4. Deploy — Render auto-detects `npm start`

---

## API Routes Reference

### Auth
| Method | Route | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Protected |
| PUT | `/api/auth/profile` | Protected |
| PUT | `/api/auth/change-password` | Protected |

### Scores
| Method | Route | Auth |
|---|---|---|
| GET | `/api/scores` | Subscriber |
| POST | `/api/scores` | Subscriber |
| PUT | `/api/scores/:id` | Subscriber |
| DELETE | `/api/scores/:id` | Subscriber |

### Draws
| Method | Route | Auth |
|---|---|---|
| GET | `/api/draws` | Public |
| GET | `/api/draws/current` | Public |
| GET | `/api/draws/my` | Subscriber |
| POST | `/api/draws/simulate` | Admin |
| POST | `/api/draws/publish` | Admin |

### Charities
| Method | Route | Auth |
|---|---|---|
| GET | `/api/charities` | Public |
| GET | `/api/charities/:slug` | Public |
| POST | `/api/charities` | Admin |
| PUT | `/api/charities/:id` | Admin |
| DELETE | `/api/charities/:id` | Admin |

### Payments
| Method | Route | Auth |
|---|---|---|
| POST | `/api/payments/create-checkout` | Protected |
| POST | `/api/payments/portal` | Protected |
| POST | `/api/payments/webhook` | Public (Stripe signed) |
| GET | `/api/payments/history` | Protected |

### Admin
| Method | Route | Auth |
|---|---|---|
| GET | `/api/admin/analytics` | Admin |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/:id` | Admin |
| PUT | `/api/admin/users/:id/subscription` | Admin |

---

## Key Business Logic

### Rolling 5-Score System
- Users can store max 5 scores (1–45 Stableford)
- Adding a 6th automatically removes the oldest by date
- Scores sorted descending (most recent first)
- Implemented in `User.methods.addScore()` in `models/User.js`

### Draw Engine (`services/drawEngine.js`)
- **Random**: 5 unique numbers drawn from 1–45
- **Algorithmic**: Weighted by frequency of scores across all active subscribers
- **Matching**: User's 5 scores checked against 5 drawn numbers
- **Prize tiers**: 3-match (25%), 4-match (35%), 5-match/jackpot (40%)
- **Jackpot rollover**: If no 5-match winner, jackpot carries to next month

### Prize Pool Calculation
- Fixed £ amount per subscriber per month goes to pool
- Pool split: 40% jackpot / 35% four-match / 25% three-match
- Multiple winners in same tier split equally
- Admin runs simulation first, then publishes

### Charity Contribution
- Min 10% of subscription fee to chosen charity
- User can increase percentage anytime
- Admin can view total charity distributions in analytics

---

## Testing Checklist

- [ ] User signup & login
- [ ] Subscription flow (monthly and yearly via Stripe)
- [ ] Score entry — 5-score rolling logic
- [ ] Draw simulation and publish
- [ ] Charity selection and contribution %
- [ ] Winner verification flow
- [ ] User Dashboard — all modules
- [ ] Admin Panel — all sections
- [ ] Responsive design (mobile + desktop)
- [ ] Error handling and edge cases

---

*Built for Digital Heroes — Golf Charity Subscription Platform*
