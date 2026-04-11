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
