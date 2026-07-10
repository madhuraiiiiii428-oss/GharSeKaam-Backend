# BuildMart-WholeSaler-Retailers-Hubs
# GharSekroBackend

### Backend running on:
https://gharsekrobackend-dsh5gsfehqbye8b5.centralindia-01.azurewebsites.net/

---

## Tech Stack
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Cloudinary (image uploads)
- Passport.js (authentication)
- Socket.io (real-time)

## Project Structure
```
src/
├── customer/       # Customer routes & controllers
├── shopkeeper/     # Admin/Shopkeeper routes & controllers
└── delivery/       # Delivery routes & controllers

config/             # DB, Cloudinary, Passport config
middlewares/        # Auth middlewares
prisma/             # Prisma schema
```

## Getting Started
```bash
npm install
cp .env.example .env
npm run dev
```
