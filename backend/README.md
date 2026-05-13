# Product Catalog API

A small, production-ready RESTful API for managing a product catalog. Built with **Node.js, Express, MongoDB (Mongoose), dotenv, and CORS**.

## Features

- Full CRUD on `/api/products`
- Search by name (case-insensitive)
- Filter by category
- Pagination (`page`, `limit`)
- Indexes for query optimization (`name`, `category + createdAt`)
- Centralized error handling and input validation

## Project structure

```
backend/
├── server.js
├── config/db.js
├── models/Product.js
├── routes/products.js
├── controllers/productController.js
└── middleware/
    ├── validate.js
    └── errorHandler.js
```

## Getting started

1. **Prerequisites**: Node.js 18+ and a MongoDB instance (local or Atlas).
2. **Install**:
   ```bash
   cd backend
   npm install
   ```
3. **Configure env**:
   ```bash
   cp .env.example .env
   # edit MONGO_URI / PORT
   ```
4. **Run**:
   ```bash
   npm run dev   # nodemon
   # or
   npm start
   ```

Server runs on `http://localhost:5000` by default.

## API

Base URL: `http://localhost:5000/api/products`

### Product schema

| Field       | Type   | Required | Notes               |
| ----------- | ------ | -------- | ------------------- |
| name        | string | yes      | trimmed, max 200    |
| category    | string | yes      | trimmed, max 100    |
| price       | number | yes      | >= 0                |
| description | string | no       | default `""`        |
| createdAt   | date   | auto     | defaults to `now()` |

### Endpoints

#### List products

`GET /api/products?search=&category=&page=1&limit=10`

```bash
curl "http://localhost:5000/api/products?search=phone&category=Electronics&page=1&limit=10"
```

Response:
```json
{
  "data": [ { "_id": "...", "name": "...", "category": "...", "price": 0, "description": "", "createdAt": "..." } ],
  "page": 1,
  "limit": 10,
  "total": 42,
  "totalPages": 5
}
```

#### Create

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15","category":"Electronics","price":999,"description":"Latest model"}'
```

#### Update

```bash
curl -X PUT http://localhost:5000/api/products/<id> \
  -H "Content-Type: application/json" \
  -d '{"price":899}'
```

#### Delete

```bash
curl -X DELETE http://localhost:5000/api/products/<id>
```

## Errors

- `400` validation / bad ObjectId
- `404` route or product not found
- `500` server error (stack included only in non-production)

## License

MIT