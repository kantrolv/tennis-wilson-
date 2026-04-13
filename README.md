<![CDATA[<div align="center">

# 🎾 Wilson Tennis — Cinematic E-Commerce Platform

**A premium, full-stack e-commerce web application for Wilson Tennis rackets, featuring a cinematic 3D homepage animation, multi-region pricing across 8 countries, role-based admin dashboards, and a complete shopping & checkout experience.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.182-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-Rolldown-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

---

*A website that doesn't just sell rackets — it feels like holding one.*

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Multi-Region Pricing](#-multi-region-pricing)
- [Authentication & Authorization](#-authentication--authorization)
- [3D Animation System](#-3d-animation-system)
- [Cart Synchronization](#-cart-synchronization)
- [Deployment](#-deployment)
- [Design Decisions](#-design-decisions)
- [Scripts & Utilities](#-scripts--utilities)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Wilson Tennis** is a full-stack e-commerce platform that reimagines online racket shopping through a cinematic, Apple Vision Pro–inspired web experience. The project combines cutting-edge 3D graphics (Three.js), scroll-driven animations (GSAP + Lenis), and a robust Node.js/Express backend with MongoDB to deliver a production-grade shopping application.

### What Makes This Different?

| Traditional E-Commerce | Wilson Tennis |
|------------------------|--------------|
| Static product listings | Cinematic 3D intro with physics-based ball & racket animation |
| Single currency | Multi-region pricing across 8 countries with per-region stock |
| Basic admin panel | 3-tier RBAC: User → Admin → Superadmin |
| Simple cart | Dual-storage cart (localStorage + MongoDB) with seamless sync |
| Generic styling | Premium design with glassmorphism, Playfair Display typography, and gold accents |

---

## 🔗 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | Deployed on Vercel |
| **Backend API** | Deployed on Render |
| **Database** | MongoDB Atlas (Cloud) |

---

## ✨ Key Features

### 🎬 Cinematic 3D Homepage
- **4-phase scroll-driven animation** choreographed at 60fps with Three.js and GSAP
- Interactive racket spin → ball descent → hit sequence → product showcase
- Background transitions from dark (#050505) to off-white (#F5F0EB) during the hit sequence
- Film grain overlay and smooth Lenis scrolling for a premium cinematic feel
- 3D models (.glb) loaded via React Three Fiber & Drei

### 🏪 Full E-Commerce Experience
- **Product Catalog** with advanced filtering — by series (Blade, Clash, Pro Staff, Ultra, Shift), age group, and price range
- **URL-synced filters** — shareable, bookmarkable filtered views
- **Product Details** page with grip size selection, string & cover add-ons, and real-time stock validation
- **Cart Sidebar** with quantity controls, regional pricing, and addon breakdown
- **Multi-step Checkout** — shipping address selection/creation → order review → payment simulation
- **Order History** — view past orders with full details

### 🌍 Multi-Region Support (8 Countries)
- 🇺🇸 United States (USD) | 🇬🇧 United Kingdom (GBP) | 🇫🇷 France (EUR)
- 🇩🇪 Germany (EUR) | 🇯🇵 Japan (JPY) | 🇦🇺 Australia (AUD)
- 🇮🇳 India (INR) | 🇦🇪 UAE (AED)
- **4 regions** (US, IN, GB, AE) have curated pricing stored in the database
- **4 regions** (FR, DE, JP, AU) use multiplier-based conversion from USD

### 🔐 Authentication & Role-Based Access
- JWT-based authentication with bcrypt password hashing
- **3-tier role system**: User → Admin → Superadmin
- Separate database collections for user and admin credentials
- Protected routes with automatic redirect and destination preservation

### 👑 Admin & Superadmin Dashboards
- **Admin**: Manage products, update stock & pricing (own region), view analytics, low-stock alerts
- **Superadmin**: Everything Admin has + create/delete admin accounts, global cross-region analytics

### 🕷️ Data Pipeline
- **Puppeteer + Cheerio** scraper that collects real racket data from wilson.com
- Handles anti-bot protection, cookie modals, and infinite scroll loading
- Auto-classifies rackets by series (Blade, Clash, Pro Staff, etc.)
- Seeder scripts to enrich and load scraped data into MongoDB

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │  React 19    │ │ Three.js/R3F │ │  GSAP + Lenis        │ │
│  │  SPA + Vite  │ │ 3D Animations│ │  Scroll Animations   │ │
│  └──────┬───────┘ └──────────────┘ └──────────────────────┘ │
└─────────┼───────────────────────────────────────────────────┘
          │ Axios (JWT in headers)
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL PLATFORM                           │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │  Static Build (SPA)  │  │  Serverless /api/* Proxy     │ │
│  │  cinematic-tennis/   │  │  → Express.js                │ │
│  └──────────────────────┘  └──────────────┬───────────────┘ │
└────────────────────────────────────────────┼─────────────────┘
                                             │
┌────────────────────────────────────────────┼─────────────────┐
│                    RENDER PLATFORM          │                 │
│  ┌──────────────────────────────────────────┴──────────────┐ │
│  │  Express.js 5 REST API                                  │ │
│  │  ┌────────────┐ ┌───────────┐ ┌───────────────────────┐ │ │
│  │  │ Auth (JWT) │ │ RBAC      │ │ Controllers           │ │ │
│  │  │ Middleware │ │ Middleware │ │ (8 route handlers)    │ │ │
│  │  └────────────┘ └───────────┘ └───────────┬───────────┘ │ │
│  └───────────────────────────────────────────┼─────────────┘ │
└──────────────────────────────────────────────┼───────────────┘
                                               │ Mongoose 9
┌──────────────────────────────────────────────┼───────────────┐
│                 MONGODB ATLAS                 │               │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────┴──┐ ┌───────┐ │
│  │ Users   │ │ Products │ │ Orders │ │  Carts  │ │Admins │ │
│  └─────────┘ └──────────┘ └────────┘ └─────────┘ └───────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Request Flow

```
React Component
  → utils/api.js (Axios + JWT interceptor)
    → Express Server (CORS → JSON parse → Route matching)
      → Middleware (Auth → RBAC)
        → Controller (Business logic)
          → Mongoose Model → MongoDB
            ← Response JSON
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2 | UI library (SPA framework) |
| **Vite** (Rolldown) | 7.2.5 | Build tool & dev server |
| **Three.js** | 0.182 | 3D WebGL rendering |
| **React Three Fiber** | 9.5 | React renderer for Three.js |
| **Drei** | 10.7 | Useful R3F helpers & abstractions |
| **GSAP** | 3.14 | Professional-grade animation engine |
| **Lenis** | 1.3 | Buttery smooth scroll library |
| **React Router** | 7.13 | Client-side routing |
| **Axios** | 1.13 | HTTP client with interceptors |
| **Leva** | 0.10 | GUI controls for 3D development |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express.js** | 5.2 | REST API framework |
| **Mongoose** | 9.1 | MongoDB ODM |
| **JWT** | 9.0 | Token-based authentication |
| **bcryptjs** | 3.0 | Password hashing |
| **Morgan** | 1.10 | HTTP request logger |
| **CORS** | 2.8 | Cross-origin resource sharing |
| **dotenv** | 17.2 | Environment variable management |

### Data Pipeline

| Technology | Purpose |
|-----------|---------|
| **Puppeteer** | Headless Chrome for scraping wilson.com |
| **Cheerio** | HTML parsing & data extraction |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting + serverless API proxy |
| **Render** | Backend hosting (Node.js web service) |
| **MongoDB Atlas** | Cloud database |

---

## 📁 Project Structure

```
tennis-wilson-/
│
├── cinematic-tennis/                 # 🎨 FRONTEND (React + Vite)
│   ├── api/                          # Vercel serverless proxy
│   │   └── index.js                  # Imports Express app for serverless
│   ├── public/                       # Static assets
│   │   ├── racket.glb                # 3D racket model (1.7 MB)
│   │   ├── tennis_ball.glb           # 3D tennis ball model (65 MB)
│   │   └── tennis-ball.png           # Favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Experience.jsx        # 🧠 3D animation brain (4-phase choreography)
│   │   │   ├── Racket.jsx            # 3D racket model loader (forwardRef)
│   │   │   ├── TennisBall.jsx        # 3D ball model loader (forwardRef)
│   │   │   ├── HTMLOverlay.jsx       # Scroll text prompts over 3D canvas
│   │   │   ├── Loader.jsx            # 3D asset loading screen
│   │   │   ├── ProtectedRoute.jsx    # Auth guard (login required)
│   │   │   ├── RoleProtectedRoute.jsx# RBAC guard (role verification)
│   │   │   ├── cart/
│   │   │   │   └── CartSidebar.jsx   # Slide-in cart panel
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx        # Page wrapper (Header + Footer + Cart)
│   │   │   │   ├── Header.jsx        # Navigation bar (mix-blend-mode: difference)
│   │   │   │   └── Footer.jsx        # Adaptive footer
│   │   │   ├── sections/             # Homepage content sections
│   │   │   │   ├── RacketHero.jsx    # "Designed for Precision" hero
│   │   │   │   ├── RacketStrings.jsx # String technology breakdown
│   │   │   │   ├── FrameMaterial.jsx # Frame material showcase
│   │   │   │   ├── Performance.jsx   # Performance metrics
│   │   │   │   ├── LegacyPlayers.jsx # Tennis legends (Federer, Serena)
│   │   │   │   ├── CurrentPlayers.jsx# Current pro players
│   │   │   │   ├── RacketCatalog.jsx # Shop catalog with filters (23KB)
│   │   │   │   └── CheckoutDemo.jsx  # Checkout simulation section
│   │   │   └── ui/                   # Generic UI atoms
│   │   ├── context/                  # 🧠 Global state management
│   │   │   ├── RegionContext.jsx     # Country/currency/pricing state
│   │   │   ├── AuthContext.jsx       # User authentication state
│   │   │   └── CartContext.jsx       # Shopping cart state (dual-storage)
│   │   ├── constants/                # Configuration data
│   │   ├── data/                     # Static product data (fallback)
│   │   ├── hooks/
│   │   │   └── useScroll.js          # GSAP ScrollTrigger progress tracker
│   │   ├── pages/                    # Route-level page components
│   │   │   ├── Home.jsx              # Cinematic homepage orchestrator
│   │   │   ├── Rackets.jsx           # Shop page wrapper
│   │   │   ├── ProductDetails.jsx    # Product detail page (25KB)
│   │   │   ├── Login.jsx             # Login form
│   │   │   ├── Signup.jsx            # Registration form + region selection
│   │   │   ├── Auth.jsx              # Combined auth page
│   │   │   ├── Profile.jsx           # User profile & addresses
│   │   │   ├── Checkout.jsx          # Multi-step checkout (34KB)
│   │   │   ├── Payment.jsx           # Payment simulation (35KB)
│   │   │   ├── OrderSuccess.jsx      # Order confirmation
│   │   │   ├── Orders.jsx            # Order history
│   │   │   ├── AdminDashboard.jsx    # Admin panel (31KB)
│   │   │   └── SuperadminDashboard.jsx # Superadmin panel (25KB)
│   │   ├── styles/                   # Feature-specific CSS
│   │   ├── theme/
│   │   │   └── variables.css         # CSS design tokens & variables
│   │   ├── utils/
│   │   │   ├── api.js                # Axios instance + interceptors
│   │   │   ├── regionPricing.js      # Price conversion engine
│   │   │   └── physics.js            # Frame-rate-independent damping
│   │   ├── App.jsx                   # Root component (providers + routing)
│   │   ├── main.jsx                  # Entry point (React 19 createRoot)
│   │   ├── index.css                 # Global base styles
│   │   └── App.css                   # App-level styles
│   ├── index.html                    # SPA shell
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite build configuration
│   └── vercel.json                   # Frontend-specific Vercel rewrites
│
├── server/                           # 🖥️ BACKEND (Express.js)
│   ├── config/
│   │   └── db.js                     # MongoDB connection (Mongoose)
│   ├── controllers/                  # Business logic
│   │   ├── authController.js         # Login, signup, getMe
│   │   ├── rackets.controller.js     # Product queries with filtering
│   │   ├── cartController.js         # Cart CRUD + sync
│   │   ├── orderController.js        # Order creation & retrieval
│   │   ├── productController.js      # Generic product CRUD
│   │   ├── userController.js         # Address management
│   │   ├── adminController.js        # Admin dashboard logic (20KB)
│   │   └── superadminController.js   # Superadmin operations (11KB)
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT verification (dual-collection lookup)
│   │   ├── authorize.js              # Role-based access control
│   │   └── errorMiddleware.js        # 404 handler + global error handler
│   ├── models/                       # Mongoose schemas
│   │   ├── User.js                   # User schema (bcrypt pre-save hook)
│   │   ├── Admin.js                  # Admin schema (security isolation)
│   │   ├── Product.js                # Product schema (8-region pricing/stock)
│   │   ├── Cart.js                   # Cart schema (per-user, composite keys)
│   │   └── Order.js                  # Order schema (demo mode)
│   ├── routes/                       # API route definitions
│   │   ├── authRoutes.js             # POST /signup, /login, GET /me
│   │   ├── rackets.routes.js         # GET /rackets, /rackets/:id
│   │   ├── cartRoutes.js             # GET/POST/DELETE cart operations
│   │   ├── orderRoutes.js            # POST /orders, GET /myorders
│   │   ├── productRoutes.js          # Generic product endpoints
│   │   ├── userRoutes.js             # Address CRUD
│   │   ├── admin.js                  # Admin-only endpoints
│   │   └── superadmin.js             # Superadmin-only endpoints
│   ├── utils/
│   │   └── generateToken.js          # JWT token generation helper
│   ├── data/                         # Seed data (scraped JSON)
│   ├── index.js                      # Server entry (standalone + serverless)
│   ├── seeder.js                     # Database seeder script
│   ├── seedSuperadmin.js             # Initial superadmin creation
│   ├── migrateAdmins.js              # Admin data migration
│   └── package.json                  # Backend dependencies
│
├── scraper/                          # 🕷️ DATA SCRAPER
│   ├── index.js                      # Puppeteer scraper for wilson.com
│   └── package.json                  # Scraper dependencies
│
├── vercel.json                       # Root Vercel deployment config
├── render.yaml                       # Render deployment config
├── PROJECT_DOCUMENTATION.md          # Detailed technical documentation
└── README.md                         # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** — either a local instance or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/tennis-wilson-.git
cd tennis-wilson-
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/wilson-tennis
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=5001
```

Start the backend:

```bash
npm start
# Server runs on http://localhost:5001
```

### 3. Set Up the Frontend

```bash
cd cinematic-tennis
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. (Optional) Seed the Database

```bash
cd server

# Seed superadmin account
node seedSuperadmin.js

# Seed product data
node seeder.js
```

### 5. (Optional) Run the Scraper

```bash
cd scraper
npm install

# Install Chrome for Puppeteer (if first time)
npx puppeteer browsers install chrome

# Scrape latest data from wilson.com
node index.js
# Output: wilson-rackets.json
```

---

## 🔐 Environment Variables

### Backend (`server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | ✅ |
| `NODE_ENV` | `development` or `production` | ✅ |
| `PORT` | Server port (default: 5001) | ❌ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (for image uploads) | ❌ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ❌ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ❌ |

### Frontend (`cinematic-tennis/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5001` (dev) / empty (production) |

> **Note**: In production, `VITE_API_URL` is empty — Axios calls `/api/*` on the same domain, and Vercel routes these to the Express server.

---

## 📡 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Get product by ID |
| `GET` | `/api/rackets` | Get rackets with filtering |
| `GET` | `/api/rackets/:id` | Get racket by ID |

### Protected Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/cart` | Get user's cart |
| `POST` | `/api/cart/sync` | Sync cart to database |
| `DELETE` | `/api/cart` | Clear cart |
| `POST` | `/api/orders` | Create a new order |
| `GET` | `/api/orders/myorders` | Get user's order history |
| `POST` | `/api/users/address` | Add shipping address |
| `PUT` | `/api/users/address/:id` | Update address |
| `DELETE` | `/api/users/address/:id` | Delete address |

### Admin Endpoints (JWT + Admin/Superadmin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Dashboard data & stats |
| `POST` | `/api/admin/add-product` | Add new product |
| `PUT` | `/api/admin/update-stock/:id` | Update stock levels |
| `GET` | `/api/admin/analytics` | Sales analytics |

### Superadmin Endpoints (JWT + Superadmin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/superadmin/dashboard` | Global dashboard |
| `POST` | `/api/superadmin/create-admin` | Create admin account |
| `DELETE` | `/api/superadmin/delete-admin/:id` | Delete admin account |

---

## 🗄 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  role: 'user' | 'admin' | 'superadmin',
  region: 'US' | 'GB' | 'FR' | 'DE' | 'JP' | 'AU' | 'IN' | 'AE',
  addresses: [{
    label: String,        // "Home", "Office"
    fullName: String,
    phone: String,
    address: String,
