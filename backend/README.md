# Workspace Booking System - Backend

Clean architecture Node.js + Express + TypeScript backend for workspace booking.

## Architecture

```
src/
├── models/         # Data models (Room, Booking)
├── db/            # In-memory storage
├── utils/         # Pricing, validation, datetime utilities
├── services/      # Business logic (roomService, bookingService, analyticsService)
├── routes/        # API routes
├── middleware/    # Error handling
├── app.ts         # Express app setup
└── server.ts      # Server bootstrap
```

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server runs on http://localhost:3000

## API Endpoints

### Rooms
- `GET /api/rooms` - List all rooms

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List all bookings
- `POST /api/bookings/:id/cancel` - Cancel booking

### Analytics
- `GET /api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD` - Revenue analytics

## Example Requests

### Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "101",
    "userName": "Priya",
    "startTime": "2025-11-20T10:00:00.000Z",
    "endTime": "2025-11-20T12:30:00.000Z"
  }'
```

### Cancel Booking
```bash
curl -X POST http://localhost:3000/api/bookings/b1/cancel
```

### Get Analytics
```bash
curl "http://localhost:3000/api/analytics?from=2025-11-01&to=2025-11-30"
```

## Features

- ✅ Peak hour pricing (Mon-Fri 10-13, 16-19 IST)
- ✅ Conflict detection (overlapping bookings)
- ✅ 2-hour cancellation policy
- ✅ 30-minute billing slots
- ✅ Analytics by date range
- ✅ Clean architecture

## Deployment

Works on Render, Railway, Heroku, or any Node.js host.

Build: `npm run build`
Start: `npm start`
