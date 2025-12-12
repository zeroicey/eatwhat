# EatWhat API Backend

Backend API service for EatWhat WeChat Mini Program.

## Tech Stack

- Node.js + Express.js
- MongoDB (Mongoose ODM)
- Minio (Object Storage)
- JWT Authentication

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Start development:
```bash
pnpm dev
```

4. Production:
```bash
pnpm start
```

## API Endpoints

### Auth
- POST /api/auth/login - WeChat login
- POST /api/auth/refresh - Refresh token

### Stores
- GET /api/stores - List stores
- POST /api/stores - Create store
- GET /api/stores/:id - Get store
- PUT /api/stores/:id - Update store
- DELETE /api/stores/:id - Delete store

### Menus
- GET /api/menus - List menu items
- POST /api/menus - Create menu item
- POST /api/menus/:id/like - Like menu item
- POST /api/menus/:id/report - Report menu item

### Moments
- GET /api/moments - List moments
- POST /api/moments - Create moment
- GET /api/moments/:id - Get moment
- POST /api/moments/:id/like - Like moment
- GET /api/moments/:id/comments - Get comments
- POST /api/moments/:id/comments - Add comment

### Storage
- POST /api/storage/upload-url - Get upload URL
- POST /api/storage/access-url - Get access URL

## Architecture

The project follows a layered architecture:
- Routes: API endpoint definitions
- Controllers: Request/response handling
- Services: Business logic
- Models: Data models and database schemas
- Middlewares: Cross-cutting concerns (auth, error handling, rate limiting)
- Utils: Helper functions and constants
