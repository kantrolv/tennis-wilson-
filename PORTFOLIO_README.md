**Project Overview: Wilson Tennis E-Commerce Platform**

**Project Objective**
What problem was the project solving? Who was it for?
This project was built to reimagine the traditional online shopping experience by creating a premium, Apple Vision Pro-inspired e-commerce platform for Wilson tennis rackets. It targets tennis enthusiasts and premium sports consumers. The main objective was to solve the problem of static, unengaging product catalogs by introducing a highly interactive 3D cinematic presentation, while simultaneously handling complex business logic like multi-region pricing (8 countries), role-based access control (RBAC), and persistent shopping carts.

**Technologies Used**
Frontend:
- React 19 (SPA) & Vite
- Three.js, React Three Fiber, Drei (3D Graphics)
- GSAP & Lenis (Scroll-driven animations)
- React Router v7 & Axios
- CSS Custom Properties & Modules

Backend:
- Node.js (v18+) & Express.js 5
- MongoDB Atlas & Mongoose 9 (Database)
- JSON Web Tokens (JWT) & bcryptjs (Authentication)

Other Tools:
- Puppeteer & Cheerio (Data Scraper)
- Vercel (Frontend Deployment)
- Render (Backend Deployment)

**Database Design**
The database was designed using MongoDB (NoSQL) with Mongoose schemas, heavily focused on security and region-specific e-commerce data:
- Users Collection: Stores user details, hashed passwords, roles, selected regions, and shipping addresses.
- Admins Collection: A completely separate collection isolated from normal users for enhanced security.
- Products Collection: Stores racket details with an advanced pricing object (dedicated prices in 8 currencies) and a stock object tracking inventory per-region and per-grip-size.
- Carts Collection: References the user ObjectId and contains cartItems with a composite cartId (combining product ID, grip size, string, and cover).
- Orders Collection: References the user and stores finalized order items, region, shipping address, and total price.

**APIs Developed**
Built a complete RESTful backend with Express:
- Auth: POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me
- Products: GET /api/rackets (with complex filtering query parameters), GET /api/products/:id
- Cart: GET /api/cart, POST /api/cart/sync (for dual-storage syncing), DELETE /api/cart
- Orders: POST /api/orders, GET /api/orders/myorders
- Admin/Superadmin: Protected routes like GET /api/admin/dashboard, PUT /api/admin/update-stock/:id, and POST /api/superadmin/create-admin

**Your Contribution**
As a Full-Stack Developer, I architected and implemented the entire application from scratch:
- 3D Animation Engine: Engineered the 60fps cinematic scroll-driven 3D homepage using Three.js and GSAP.
- Backend Architecture: Built the Express API and designed the MongoDB data models.
- Authentication System: Implemented a secure JWT-based login/signup flow with cross-origin resource sharing (CORS) configured and separate routing for standard users and superadmins.
- Multi-Region Logic: Developed dynamic currency conversion and localized inventory tracking for 8 different countries.
- Web Scraper: Built a Node.js Puppeteer script to scrape authentic racket data directly from the official Wilson site to seed the database.

**Challenges Faced**
Cart Synchronization & Rapid Requests: 
Managing the user's shopping cart state seamlessly between guest browsing (unauthenticated) and logged-in states, while ensuring that rapid clicks on "quantity adjustments" didn't overload the backend or create race conditions in the database.

**How You Solved It**
To resolve the cart synchronization challenge, I implemented a Dual Storage Cart System. 
1. I stored the cart locally in localStorage for offline backup and guest users. 
2. Once the user logs in, the app cross-references the local cart with the MongoDB cart and performs a merge (pushing local items to the DB if the DB is empty).
3. To prevent hammering the backend API during rapid quantity changes, I implemented a 400ms debounced POST request to /api/cart/sync. This ensured that the UI remained instantly responsive (optimistic UI updates) while safely and efficiently batching database updates.
