# Workspace Booking & Pricing System

A production-quality workspace booking system with dynamic pricing, conflict detection, and analytics.

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript (clean architecture)
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Database**: In-memory storage (designed to scale to PostgreSQL/MongoDB)

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on http://localhost:3000

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on http://localhost:5173

## 📡 API Endpoints

### Rooms

**GET** `/api/rooms`
```bash
curl http://localhost:3000/api/rooms
```

Response:
```json
[
  {
    "id": "101",
    "name": "Cabin 1",
    "baseHourlyRate": 300,
    "capacity": 4
  }
]
```

### Bookings

**POST** `/api/bookings` - Create booking
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

Success Response:
```json
{
  "bookingId": "b1",
  "roomId": "101",
  "userName": "Priya",
  "startTime": "2025-11-20T10:00:00.000Z",
  "endTime": "2025-11-20T12:30:00.000Z",
  "totalPrice": 975,
  "status": "CONFIRMED",
  "createdAt": "2025-11-17T14:30:00.000Z"
}
```

Conflict Response:
```json
{
  "error": "Room already booked from 10:30 AM to 11:30 AM"
}
```

**GET** `/api/bookings` - List all bookings
```bash
curl http://localhost:3000/api/bookings
```

**POST** `/api/bookings/:id/cancel` - Cancel booking
```bash
curl -X POST http://localhost:3000/api/bookings/b1/cancel
```

Response:
```json
{
  "message": "Booking cancelled successfully"
}
```

Error (less than 2 hours before start):
```json
{
  "error": "Cannot cancel booking less than 2 hours before start time"
}
```

### Analytics

**GET** `/api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD`
```bash
curl "http://localhost:3000/api/analytics?from=2025-11-01&to=2025-11-30"
```

Response:
```json
[
  {
    "roomId": "101",
    "roomName": "Cabin 1",
    "totalHours": 15.5,
    "totalRevenue": 5250
  },
  {
    "roomId": "102",
    "roomName": "Cabin 2",
    "totalHours": 12.0,
    "totalRevenue": 6800
  }
]
```

## ✨ Features

### Dynamic Pricing
- **Timezone**: Asia/Kolkata (IST)
- **Peak Hours**: Monday–Friday
  - 10:00–13:00 → 1.5x base rate
  - 16:00–19:00 → 1.5x base rate
- **Off-Peak**: All other times → 1x base rate
- **Billing**: 30-minute slots
- **Currency**: Indian Rupees (₹)

### Conflict Detection
- Prevents overlapping bookings for same room
- Algorithm: `newStart < existingEnd AND newEnd > existingStart`
- Allows back-to-back bookings (end time == start time)

### Cancellation Policy
- Only allowed if > 2 hours before start time
- Cancelled bookings excluded from analytics

### Business Rules
- Booking duration: 15 minutes to 12 hours
- Start time must be before end time
- Room capacity validation

## 📁 Project Structure

```
/
├── backend/              # Node.js + Express backend
│   ├── src/
│   │   ├── models/       # Data models (Room, Booking)
│   │   ├── db/           # In-memory storage
│   │   ├── utils/        # Pricing, validation, datetime
│   │   ├── services/     # Business logic layer
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Error handling
│   │   ├── app.ts        # Express app setup
│   │   └── server.ts     # Server bootstrap
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   ├── types/        # TypeScript types
│   │   └── main.tsx      # App entry point
│   ├── package.json
│   └── vite.config.ts
│
├── README.md             # This file
└── ARCHITECTURE.md       # Technical architecture docs
```

## 🌐 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Build**: `npm run build`
2. **Start**: `npm start`
3. **Environment Variables**:
   - `PORT` (default: 3000)
   - `NODE_ENV=production`

### Frontend Deployment (Netlify/Vercel)

1. **Build**: `npm run build`
2. **Output**: `dist/` directory
3. **Environment Variables**:
   - `VITE_API_BASE_URL` (your backend URL)

### Deployment Links
- **Backend**: [Deploy to Render](https://render.com)
- **Frontend**: [Deploy to Netlify](https://netlify.com)

## 🧪 Testing

```bash
# Backend
cd backend
npm test  # (tests not implemented)

# Frontend
cd frontend
npm test  # (tests not implemented)
```

## 🔧 Technology Stack

### Backend
- Node.js 18+
- Express 4.x
- TypeScript 5.x
- date-fns + date-fns-tz (timezone handling)

### Frontend
- React 18
- Vite
- TypeScript
- TailwindCSS
- React Router
- React Hook Form + Zod
- Lucide React (icons)
- Sonner (toast notifications)

## 🤖 AI Development Notes

This project was built with AI assistance. Key areas where AI was used:

1. **Architecture Design**: Clean separation of concerns (routes → services → models → db → utils)
2. **Pricing Algorithm**: Dynamic peak/off-peak pricing with 30-minute slot calculation
3. **Conflict Detection**: Robust overlap detection logic
4. **TypeScript Types**: Strong typing throughout the codebase
5. **Frontend Components**: React components with proper state management
6. **API Integration**: Type-safe API client with error handling

### AI Prompts Used
- "Create a workspace booking system with dynamic pricing"
- "Implement conflict detection for booking overlaps"
- "Add peak hour pricing for IST timezone"
- "Build analytics dashboard for room revenue"

## 📝 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions, please open a GitHub issue.
