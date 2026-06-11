# ShopNow — Full Stack E-Commerce Platform

A production-ready full-stack e-commerce platform built with the MERN stack, Stripe payments, Cloudinary image storage, JWT authentication, and a complete admin dashboard.

---

## 🚀 Features

### Customer
- Browse, search, and filter products
- Product detail pages with image gallery and reviews
- Shopping cart with quantity management and save-for-later
- Wishlist management
- Stripe payment integration (cards, UPI, wallets)
- Order tracking with real-time status updates
- User profile with multiple addresses

### Admin
- Dashboard with revenue charts, order analytics, and top products
- Full product CRUD with image uploads via Cloudinary
- Order management with status updates and tracking
- User management with role assignment
- Category management

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Redux Toolkit, React Router 6, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (access + refresh tokens), bcrypt |
| Payments | Stripe |
| Storage | Cloudinary |
| Email | Nodemailer (SMTP) |
| Charts | Recharts |
| CI/CD | GitHub Actions |
| Containers | Docker + Docker Compose |

---

## 📁 Project Structure

```
ecommerce/
├── backend/
│   ├── config/          # DB, Cloudinary, Logger
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, error handling, validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Helpers (email, tokens, API features)
│   ├── tests/           # Jest + Supertest tests
│   └── server.js        # Entry point
│
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI components
│       │   ├── cart/
│       │   ├── common/
│       │   ├── layout/
│       │   └── product/
│       ├── pages/       # Route-level pages
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── cart/
│       │   ├── checkout/
│       │   ├── order/
│       │   └── product/
│       ├── services/    # Axios API instance
│       ├── store/       # Redux slices
│       └── styles/      # Tailwind CSS
│
├── .github/workflows/   # CI/CD pipeline
└── docker-compose.yml
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account
- Cloudinary account

### 1. Clone & Install

```bash
git clone <repo-url>
cd ecommerce

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** — copy and fill in `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```

Required values:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=...
SMTP_PASSWORD=...
CLIENT_URL=http://localhost:3000
```

**Frontend** — copy and fill in `frontend/.env.example`:
```bash
cp frontend/.env.example frontend/.env
```
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run in Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

App runs at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

---

## 🐳 Docker (optional)

```bash
# Copy and fill env files first, then:
docker-compose up --build
```

---

## 💳 Stripe Webhook Setup

For local development, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```
Copy the webhook secret into `STRIPE_WEBHOOK_SECRET` in your `.env`.

**Test cards:**
| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined |
| `4000 0025 0000 3155` | 3D Secure required |

Use any future expiry date, any CVC, any postal code.

---

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

---

## 📦 Deployment

### Backend — Render/Railway

1. Connect GitHub repo
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add all environment variables
5. Enable auto-deploy on push to `main`

### Frontend — Vercel/Netlify

1. Connect GitHub repo, set root to `frontend/`
2. Build command: `npm run build`
3. Output directory: `build`
4. Add `REACT_APP_API_URL` and `REACT_APP_STRIPE_PUBLISHABLE_KEY` environment variables

### Database — MongoDB Atlas

1. Create a free cluster at mongodb.com/atlas
2. Whitelist your server IPs (or 0.0.0.0/0 for all)
3. Copy the connection string into `MONGO_URI`

---

## 🔐 Default Admin Account

Create an admin user by registering normally then running in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## 🗺 API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/logout` | Logout | Private |
| POST | `/api/auth/refresh-token` | Refresh JWT | Public |
| POST | `/api/auth/forgot-password` | Forgot password | Public |
| POST | `/api/auth/reset-password/:token` | Reset password | Public |
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/:id` | Get product | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| GET | `/api/cart` | Get cart | Private |
| POST | `/api/cart` | Add to cart | Private |
| PUT | `/api/cart/:itemId` | Update item | Private |
| DELETE | `/api/cart/:itemId` | Remove item | Private |
| POST | `/api/orders` | Create order | Private |
| GET | `/api/orders` | My orders | Private |
| GET | `/api/orders/:id` | Order detail | Private |
| PUT | `/api/orders/:id/cancel` | Cancel order | Private |
| GET | `/api/orders/admin/all` | All orders | Admin |
| PUT | `/api/orders/:id/status` | Update status | Admin |
| GET | `/api/orders/admin/analytics` | Analytics | Admin |
| POST | `/api/payments/create-intent` | Stripe intent | Private |
| POST | `/api/payments/webhook` | Stripe webhook | Public |
| GET | `/api/reviews/:productId` | Get reviews | Public |
| POST | `/api/reviews/:productId` | Write review | Private |
| GET | `/api/wishlist` | Get wishlist | Private |
| POST | `/api/wishlist/toggle` | Toggle item | Private |

---

## 📄 License

MIT License — see [LICENSE](LICENSE)
