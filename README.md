# Wilson Cinematic Universe 🎾

A premium, immersive web experience for Wilson Tennis, featuring a 3D cinematic intro, high-end e-commerce frontend, and a product data scraper.

## 🌟 Features

### 1. Cinematic Frontend (`/cinematic-tennis`)
A "Apple Vision Pro" style website built with **React**, **Three.js**, and **GSAP**.
*   **3D Intro**: Interactive tennis ball hit sequence that transitions seamlessly into the website.
*   **Premium Design**: Royal Blue & Gold theme (`src/theme/variables.css`), smooth scrolling (Lenis), and glassmorphism UI.
*   **Sections**:
    *   **Hero**: "Designed for precision" marketing layout.
    *   **Tech**: Detailed breakdown of Racket Strings and Frame Materials.
    *   **Players**: Showcase of Legends (Federer, Serena) and Current Pros.
    *   **Shop**: Functional demo grid with filtering.
*   **Checkout**: Simulation modal for product purchase.
*   **Region System**: Global currency and language selector (supports US, UK, EU, JP, AU, India).

### 2. Web Scraper (`/scraper`)
A sophisticated Node.js script to collect real racket data from Wilson.com.
*   **Technology**: Built with **Puppeteer** (to handle anti-bot protection) and **Cheerio**.
*   **Output**: Saves scraped data to `wilson-rackets.json`.

### 3. Backend (`/server`)
*   Basic server setup (Node.js/Express) for potential API extensions.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   NPM

### 1. Run the Frontend
```bash
cd cinematic-tennis
npm install
npm run dev
```
> Open `http://localhost:5173` to see the experience.

### 2. Run the Scraper
```bash
cd scraper
npm install
# Install Chrome for Puppeteer if needed
npx puppeteer browsers install chrome
node index.js
```

---

## 🛠️ Tech Stack
*   **Frontend**: React, Vite, Three.js (@react-three/fiber), GSAP, Lenis Scroll.
*   **Styling**: CSS Modules, polished "Royal" theme variables.
*   **Scraping**: Puppeteer, Cheerio.

## 🎨 Theme
*   **Primary**: Royal Blue (`#051025`)
*   **Accent**: Gold (`#D4AF37`)
*   **Typography**: Playfair Display (Serif) & Inter (Sans).
