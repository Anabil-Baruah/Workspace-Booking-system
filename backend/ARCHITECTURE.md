# Architecture Documentation

## Overview

Clean architecture with clear separation of concerns:
**routes → services → models → db → utils**

## Layers

### 1. Routes (`src/routes/`)
- HTTP endpoint definitions
- Request/response handling
- Thin layer, delegates to services

### 2. Services (`src/services/`)
- Business logic layer
- Orchestrates operations
- Uses utils for calculations/validations
- Interacts with storage

**Services:**
- `RoomService` - Room queries
- `BookingService` - Booking creation, cancellation
- `AnalyticsService` - Revenue analytics

### 3. Models (`src/models/`)
- TypeScript interfaces
- Data structure definitions
- No business logic

### 4. Database (`src/db/`)
- `storage.ts` - In-memory storage implementation
- CRUD operations
- Easily swappable for PostgreSQL/MongoDB

### 5. Utils (`src/utils/`)
- Pure functions
- No side effects
- Reusable logic

**Utils:**
- `pricing.ts` - Dynamic pricing calculation (peak/off-peak)
- `validation.ts` - Booking validation rules
- `datetime.ts` - Timezone handling, overlap detection

## Key Design Decisions

### Pricing Logic
- Uses Asia/Kolkata timezone (date-fns-tz)
- Peak hours: Mon-Fri 10-13, 16-19
- 1.5x multiplier during peak
- 30-minute billing slots

### Conflict Detection
```typescript
overlap = newStart < existingEnd AND newEnd > existingStart
```
(Allows back-to-back bookings where end == start)

### Cancellation Policy
- Only if > 2 hours before start
- Cancelled bookings excluded from analytics

### Scalability
- In-memory storage uses interfaces
- Easy migration to real database
- Service layer remains unchanged

## Data Flow Example (Create Booking)

```
POST /api/bookings
  ↓
routes/bookings.ts
  ↓
bookingService.createBooking()
  ↓ validates room
  ↓ validates times (utils/validation.ts)
  ↓ checks conflicts (utils/datetime.ts)
  ↓ calculates price (utils/pricing.ts)
  ↓
storage.addBooking()
  ↓
return Booking
```

## Testing Strategy (Not Implemented)
- Unit tests for utils (pure functions)
- Integration tests for services
- E2E tests for routes

## Possible future Enhancements
- PostgreSQL/MongoDB adapter
- Authentication/authorization
- Rate limiting
- Caching layer
- WebSocket for real-time availability
