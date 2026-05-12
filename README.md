<div align="center">
  <img src="./cinematic-tennis/public/tennis-ball.png" alt="Wilson Tennis Logo" width="120" />
  <h1>🎾 Wilson Tennis — Cinematic E-Commerce Platform</h1>
  <p>
    <b>A premium, full-stack e-commerce web application reimagining online racket shopping.</b>
  </p>
  <p>
    Featuring a cinematic 3D homepage animation, multi-region pricing, dual-storage cart, and a complete shopping experience.
  </p>

  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
  [![Three.js](https://img.shields.io/badge/Three.js-0.182-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
  [![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 📑 Table of Contents

1. [Project Title and Description](#1-project-title-and-description)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Installation Guide](#4-installation-guide)
5. [Dependencies](#5-dependencies)
6. [Environment Variables](#6-environment-variables)
7. [How to Run the Website](#7-how-to-run-the-website)
8. [Authentication / Login Flow](#8-authentication--login-flow)
9. [Folder Structure](#9-folder-structure)
10. [Screenshots / Preview](#10-screenshots--preview)
11. [Deployment](#11-deployment)
12. [API Documentation](#12-api-documentation)
13. [Troubleshooting](#13-troubleshooting)
14. [Future Improvements](#14-future-improvements)
15. [Contributing](#15-contributing)
16. [License](#16-license)
17. [Author Section](#17-author-section)

---

## 1. Project Title and Description

### Wilson Tennis — Cinematic E-Commerce Platform
**Wilson Tennis** is a robust, full-stack e-commerce platform built to provide a premium, Apple Vision Pro–inspired shopping experience. It doesn't just sell rackets; it feels like holding one. 

**Purpose:** To showcase advanced front-end animation capabilities integrated with a secure, scalable back-end architecture. The platform supports complex scenarios like multi-region pricing (8 countries), role-based access control (RBAC), and persistent dual-storage shopping carts.

---

## 2. Features

- 📱 **Responsive UI:** A mobile-first design leveraging glassmorphism, modern typography (Playfair Display, Inter), and a sophisticated dark-to-light theme transition.
- 🎬 **Animations:** 4-phase, scroll-driven 60fps 3D cinematic animations built using Three.js and choreographed with GSAP & Lenis smooth scrolling.
- 🔐 **Authentication System:** Secure JWT-based authentication with bcrypt password hashing and an automatic redirect flow.
- 🛒 **Interactive Pages:** Dynamic product filtering (by series, age, price) with URL synchronization, interactive multi-step checkout, and real-time stock validation.
- 🌍 **Multi-Region Support:** Dedicated pricing and currency exchange logic supporting 8 global regions (USD, GBP, EUR, JPY, AUD, INR, AED).
- 👑 **Admin Dashboards:** 3-tier RBAC (User, Admin, Superadmin) allowing inventory management, analytics tracking, and cross-region overview.

---

## 3. Tech Stack

### Frontend
- **Framework:** React 19 (SPA)
- **Build Tool:** Vite 7 (Rolldown)
- **3D Rendering:** Three.js, React Three Fiber, Drei
- **Animations:** GSAP, Lenis (Smooth Scroll)
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Styling:** CSS Custom Properties / CSS Modules

### Backend
- **Framework:** Express.js 5
- **Runtime:** Node.js v18+
- **Database:** MongoDB Atlas (NoSQL)
- **ODM:** Mongoose 9
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Logging/Utility:** Morgan, dotenv, cors

### Data Scraper
- **Tools:** Puppeteer, Cheerio

---

## 4. Installation Guide

Follow these step-by-step instructions to get the project running locally on your desktop (Windows, Mac, or Linux).

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/tennis-wilson-.git
cd tennis-wilson-
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../cinematic-tennis
npm install
```

### Step 4: Environment Variable Setup
*(Refer to the [Environment Variables](#6-environment-variables) section below on what files to create)*

### Step 5: Database Setup
Make sure you have a MongoDB instance running. You can set up a free cloud cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
Optional: Seed your database with dummy data:
```bash
cd server
node seedSuperadmin.js
node seeder.js
```

---

## 5. Dependencies

Here are the primary packages required to run this project. They will be installed automatically when you run `npm install` in the respective directories.

### Frontend (`cinematic-tennis/package.json`)
- `react`, `react-dom` (^19.2.0)
- `react-router-dom` (^7.13.0)
- `three` (^0.182.0), `@react-three/fiber` (^9.5.0), `@react-three/drei` (^10.7.7)
- `gsap` (^3.14.2), `lenis` (^1.3.17)
- `axios` (^1.13.4)
- `vite` (Rolldown version)

### Backend (`server/package.json`)
- `express` (^5.2.1)
- `mongoose` (^9.1.4)
- `jsonwebtoken` (^9.0.3), `bcryptjs` (^3.0.3)
- `cors` (^2.8.6), `dotenv` (^17.2.3), `morgan` (^1.10.1)

---

## 6. Environment Variables

Create `.env` files in both the frontend and backend directories.

### Backend (`server/.env`)
Create this file in the `server` folder:
```env
# MongoDB Connection String (Required)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/wilson-tennis

# Secret key for signing JWT tokens (Required)
JWT_SECRET=your-super-secret-jwt-key

# Running environment (development or production)
NODE_ENV=development

# Server Port
PORT=5001
```

### Frontend (`cinematic-tennis/.env`)
Create this file in the `cinematic-tennis` folder:
```env
# The URL where your local Express backend is running
VITE_API_URL=http://localhost:5001
```

---

## 7. How to Run the Website

You need to run both the Backend and Frontend servers concurrently for the app to function properly.

### Start the Backend Server
Open a terminal instance:
```bash
cd server
npm run dev
```
> The backend API will start on **http://localhost:5001**

### Start the Frontend Server
Open a second terminal instance:
```bash
cd cinematic-tennis
npm run dev
```
> The React app will start on **http://localhost:5173**

Open your browser and navigate to `http://localhost:5173` to view the application.

### Production Build Command
To build the frontend for production:
```bash
cd cinematic-tennis
npm run build
```

---

## 8. Authentication / Login Flow

The platform uses a robust, JWT-backed security model with dual-collection isolation (separate collections for Users and Admins).

- **Sign Up:** Users register via `/signup`. The app hashes their password with `bcryptjs` and securely stores it. A JWT is issued and stored in local storage.
- **Login:** Users log in via `/login`. The system verifies the credentials against the Database.
- **Session:** The JWT is attached as a `Bearer` token via Axios interceptors on every subsequent request. If the app reloads, a `/api/auth/me` call validates the session.

### User Roles & Demo Credentials
The application is pre-configured with default accounts so you can test the different access levels. 

| Role | Login URL | Default Email | Default Password | Dashboard Route |
|------|-----------|---------------|------------------|-----------------|
| **Superadmin** | `/login` | `superadmin@wilson.com` | `SuperAdmin@123` | `/superadmin/dashboard` |
| **Admin** | `/login` | *(Create via Superadmin)* | *(Create via Superadmin)* | `/admin/dashboard` |
| **User** | `/login` | *(Sign up to create one)* | *(User defined)* | `/profile`, `/checkout` |

> **How to Access:** Go to the standard login page (`/login`) and enter the Superadmin credentials. The system will automatically detect your role and route you to the `/superadmin/dashboard` page.

### Protected Routes
- `/profile`, `/checkout`, `/orders` (Requires **User** login)
- `/admin/dashboard` (Requires **Admin** or **Superadmin** privileges)
- `/superadmin/dashboard` (Requires **Superadmin** privileges)

---

## 9. Folder Structure

```text
tennis-wilson-/
├── cinematic-tennis/                 # Frontend React Application
│   ├── public/                       # Static assets (3D models: .glb, images)
│   ├── src/
│   │   ├── components/               # React components (3D Canvas, UI, Sections)
│   │   ├── context/                  # Global Context API (Auth, Cart, Region)
│   │   ├── pages/                    # Main route pages (Home, Rackets, Checkout, etc.)
│   │   ├── styles/                   # Global and module-level CSS
│   │   └── utils/                    # Utility functions (Axios, Physics helpers)
│   └── index.html                    # Main HTML shell
├── server/                           # Backend Node/Express Application
│   ├── config/                       # DB connection files
│   ├── controllers/                  # Route logic (Auth, Products, Cart)
│   ├── middleware/                   # JWT & Role-based authentication
│   ├── models/                       # Mongoose schemas (User, Product, Order)
│   ├── routes/                       # Express API endpoints
│   └── index.js                      # Server entry point
└── scraper/                          # Node.js Puppeteer Scraper scripts
```



---

## 11. Deployment

This project is built to be easily deployed on modern cloud platforms.

### Frontend Deployment (Vercel)
1. Push your code to GitHub.
2. Go to Vercel and import your repository.
3. Set the Root Directory to `cinematic-tennis`.
4. Ensure the Build Command is `npm run build` and Output Directory is `dist`.
5. Deploy! Vercel will automatically handle routing thanks to the `vercel.json` file in the root directory.

### Backend Deployment (Render)
1. Go to Render.com and create a new "Web Service".
2. Connect your GitHub repository.
3. Set the Root Directory to `server`.
4. Set the Build Command to `npm install`.
5. Set the Start Command to `node index.js`.
6. Add your Environment Variables (e.g., `MONGO_URI`, `JWT_SECRET`).
7. Deploy!

> **Note:** Once the backend is deployed, make sure to update your Frontend's `VITE_API_URL` to point to the live Render URL.

---

## 12. API Documentation

Here is a quick overview of the main REST API endpoints available:

### Authentication
- `POST /api/auth/signup` - Register a new account
- `POST /api/auth/login` - Authenticate and get JWT
- `GET /api/auth/me` - Get the current user profile (Requires JWT)

### Products
- `GET /api/products` - Retrieve all products
- `GET /api/products/:id` - Retrieve a specific product
- `GET /api/rackets` - Retrieve products with complex query filtering

### Cart & Orders
- `GET /api/cart` - Retrieve user's cart (Requires JWT)
- `POST /api/cart/sync` - Sync local cart to database (Requires JWT)
- `POST /api/orders` - Place a new order (Requires JWT)

---

## 13. Troubleshooting

- **MongoDB "Authentication Failed" or "Network Error":**
  Ensure your current IP address is whitelisted in your MongoDB Atlas Network Access settings.
- **3D Models Failing to Load:**
  Ensure the `.glb` files are correctly located in the `cinematic-tennis/public` folder. Large models (like the 65MB tennis ball) may take time to load on slower connections.
- **CORS Issues on Frontend:**
  Make sure your `VITE_API_URL` in the frontend `.env` matches the backend port perfectly, and that the backend `server/index.js` CORS configuration allows your frontend origin.
- **"Vite/Rolldown Not Found":**
  If `npm run dev` fails in the frontend, try clearing your node_modules and running `npm install` again.

---

## 14. Future Improvements

- [ ] Implement a real payment gateway like Stripe instead of simulated payments.
- [ ] Add unit and integration testing via Jest and Cypress.
- [ ] Integrate a Headless CMS (like Sanity) for marketing content.
- [ ] Implement WebSockets for real-time stock reduction updates during checkout.
- [ ] Optimize 3D model geometry for faster load times on mobile networks.

---

## 15. Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 17. Author Section

**Developed with ❤️ by Vamshi Krishna Kantrol**

- **GitHub:** [kantrolv](https://github.com/kantrolv)
- **LinkedIn:** [K Vamshi Krishna](https://www.linkedin.com/in/kvamshi-krishna-4b5873333/)

*If you found this project helpful or inspiring, please consider giving it a ⭐ on GitHub!*
