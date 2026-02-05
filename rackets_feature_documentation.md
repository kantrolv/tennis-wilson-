# Shop Rackets Feature Documentation

## 1. Product Data Architecture (MongoDB)

We extended the existing `products` collection to store tennis rackets. Each racket is a document with the following schema structure, ensuring scalability and consistency:

```javascript
// models/Product.js
{
    name: String,       // Unique identifier (e.g., "Clash 100 V3 Tennis Racket")
    brand: String,      // Default: "Wilson"
    model: String,      // Grouping key (e.g., "Clash", "Blade")
    price: Number,      // Price in USD
    category: String,   // Discriminator: "racket"
    sport: String,      // Discriminator: "tennis"
    weight: Number,     // in grams
    balance: String,    // e.g., "31cm / 10 pts HL"
    material: String,   // e.g., "Carbon Fiber"
    gripSize: String,   // e.g., "4 3/8"
    description: String,// Marketing copy
    imageUrl: String,   // URL to product image
    stock: Number,      // Inventory count
    createdAt: Date,    // Timestamp
    updatedAt: Date     // Timestamp
}
```

## 2. API Endpoints

We implemented a dedicated controller (`rackets.controller.js`) and routes (`rackets.routes.js`) to handle racket-specific logic.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/rackets` | Fetch all tennis rackets | Public |
| `GET` | `/api/rackets/:id` | Fetch details for a specific racket | Public |
| `POST` | `/api/rackets` | Create a new racket manually | Admin |
| `POST` | `/api/rackets/seed`| Bulk import from `wilson_package.json` | Admin |

## 3. Data Ingestion & Seeding

The seeding process is automated via the `/api/rackets/seed` endpoint.
- **Source**: Reads from `server/data/wilson_package.json`.
- **Logic**: 
    1. Parses the JSON file.
    2. Queries the database for all existing racket names.
    3. Filters out any rackets that already exist to prevent duplicates.
    4. Inserts only new rackets using `Product.insertMany()`.

## 4. Frontend Integration

The `Shop` component (`Shop.jsx`) fetches data from the API and renders it dynamically.
- **Fetching**: `useEffect` calls `GET /api/rackets` on component mount.
- **Filtering**: Client-side filtering by "Model" (derived dynamically from the loaded data).
- **Checkout**: The `App.jsx` handles the checkout flow. usage:
    - Checks for user authentication (`localStorage`).
    - Creates an order via `POST /api/orders`.
    - Includes proper `Authorization` header with the JWT token.

## 5. Example API Response

**GET /api/rackets**

```json
[
    {
        "_id": "65c3f9a...",
        "name": "Clash 100 V3 Tennis Racket",
        "brand": "Wilson",
        "model": "Clash",
        "price": 249.00,
        "category": "racket",
        "sport": "tennis",
        "weight": 295,
        "balance": "31cm / 10 pts HL",
        "material": "Carbon Fiber",
        "stock": 50,
        "imageUrl": "https://www.wilson.com/en-us/product/clash-100-v3-0-frm-wr17280",
        "createdAt": "2024-02-09T10:00:00.000Z"
    },
    {
        "_id": "65c3f9b...",
        "name": "Blade 98 (16x19) V9 Tennis Racket",
        "brand": "Wilson",
        "model": "Blade",
        "price": 259.00,
        "category": "racket",
        "sport": "tennis",
        "weight": 305,
        "balance": "32cm / 7 pts HL",
        "material": "Braided Graphite + Basalt",
        "stock": 35,
        "imageUrl": "https://www.wilson.com/en-us/product/blade-98-16x19-v9-frm-wr14980",
        "createdAt": "2024-02-09T10:00:00.000Z"
    }
]
```
