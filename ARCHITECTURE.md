# Architecture Documentation

## Overview

This workspace booking system follows **clean architecture** principles with clear separation of concerns. The backend uses a layered approach while the frontend follows component-based architecture.

**Backend Flow**: `routes → services → models → db → utils`

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Rooms   │  │ Booking  │  │  Admin   │  │ Analytics│   │
│  │   Page   │  │   Page   │  │   Page   │  │  Panel   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴──────────────┴──────────────┘         │
│                      │ API Client                           │
└──────────────────────┼──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────┼──────────────────────────────────────┐
│                      ▼                                       │
│                   Routes Layer                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  /rooms  │  │/bookings │  │/analytics│                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       │             │              │                        │
│       ▼             ▼              ▼                        │
│  ┌─────────────────────────────────────────┐               │
│  │         Services Layer                   │               │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐│               │
│  │  │  Room    │  │ Booking  │  │Analytics││               │
│  │  │ Service  │  │ Service  │  │ Service ││               │
│  │  └────┬─────┘  └────┬─────┘  └────┬───┘│               │
│  │       │             │              │     │               │
│  │       └─────────────┴──────────────┘     │               │
│  │                     │                     │               │
│  └─────────────────────┼─────────────────────┘               │
│                        ▼                                     │
│  ┌──────────────────────────────────────────┐               │
│  │          Utils Layer (Pure Functions)     │               │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐ │               │
│  │  │ pricing │  │validation│  │datetime │ │               │
│  │  └─────────┘  └──────────┘  └─────────┘ │               │
│  └──────────────────────────────────────────┘               │
│                        │                                     │
│                        ▼                                     │
│  ┌──────────────────────────────────────────┐               │
│  │       Storage Layer (In-Memory DB)        │               │
│  │  ┌─────────┐  ┌─────────┐                │               │
│  │  │  Rooms  │  │Bookings │                │               │
│  │  │  Array  │  │  Array  │                │               │
│  │  └─────────┘  └─────────┘                │               │
│  └──────────────────────────────────────────┘               │
│                     Backend (Node.js)                        │
└──────────────────────────────────────────────────────────────┘
```

## Data Models

### Room Model

```typescript
interface Room {
  id: string;              // Unique identifier (e.g., "101")
  name: string;            // Display name (e.g., "Cabin 1")
  baseHourlyRate: number;  // Base rate per hour in INR (₹)
  capacity: number;        // Maximum occupancy
}
```

**Seed Data**: 5 predefined rooms with varying capacities and rates (₹200–₹600/hour)

### Booking Model

```typescript
interface Booking {
  bookingId: string;       // Auto-generated (e.g., "b1", "b2")
  roomId: string;          // Foreign key to Room
  userName: string;        // Name of person booking
  startTime: Date;         // Booking start (ISO 8601)
  endTime: Date;           // Booking end (ISO 8601)
  totalPrice: number;      // Calculated total in INR (₹)
  status: "CONFIRMED" | "CANCELLED";
  createdAt: Date;         // Timestamp of booking creation
}
```

**Business Rules**:
- `startTime < endTime`
- Duration: 15 minutes to 12 hours
- Status changes: CONFIRMED → CANCELLED (irreversible)

## Backend Layers

### 1. Routes Layer (`backend/src/routes/`)

**Responsibility**: HTTP endpoint definitions and request/response handling

- **Thin layer** - minimal logic
- Validates HTTP input (query params, body)
- Delegates to services
- Returns JSON responses

**Files**:
- `rooms.ts` - GET /api/rooms
- `bookings.ts` - POST /api/bookings, GET /api/bookings, POST /api/bookings/:id/cancel
- `analytics.ts` - GET /api/analytics

### 2. Services Layer (`backend/src/services/`)

**Responsibility**: Business logic orchestration

**RoomService**:
- `getRooms()` - Fetch all rooms
- `getRoomById(id)` - Fetch single room

**BookingService**:
- `createBooking(dto)` - Validate, check conflicts, calculate price, save
- `getBookings()` - Fetch all bookings
- `cancelBooking(id)` - Validate cancellation policy, update status

**AnalyticsService**:
- `getAnalytics(from, to)` - Aggregate revenue and hours by room

**Design Principles**:
- Services have **no knowledge of HTTP**
- Can be tested independently
- Use utils for calculations
- Interact with storage layer

### 3. Models Layer (`backend/src/models/`)

**Responsibility**: TypeScript interfaces and type definitions

- Pure type definitions
- No business logic
- No methods (except DTOs for transformation)

**Files**:
- `Room.ts` - Room interface
- `Booking.ts` - Booking interface + CreateBookingDTO

### 4. Storage Layer (`backend/src/db/`)

**Responsibility**: Data persistence (currently in-memory)

**Implementation**: `storage.ts`
- In-memory arrays for rooms and bookings
- CRUD operations
- **Swappable design** - interface-based for easy migration

**Migration Path**:
```typescript
// Current: In-memory
const storage = new InMemoryStorage();

// Future: PostgreSQL
const storage = new PostgreSQLStorage(connectionString);

// Future: MongoDB
const storage = new MongoDBStorage(mongoUri);
```

Services remain **unchanged** during migration.

### 5. Utils Layer (`backend/src/utils/`)

**Responsibility**: Pure functions with no side effects

#### `pricing.ts` - Dynamic Pricing Calculator

**Algorithm**:
1. Split booking into 30-minute slots
2. For each slot, check if peak hour:
   - **Peak**: Monday–Friday, 10:00–13:00 or 16:00–19:00 (IST)
   - **Multiplier**: Peak = 1.5x, Off-peak = 1x
3. Calculate: `slotPrice = baseRate × slotDuration × multiplier`
4. Sum all slots, round to nearest whole number

**Example** (2.5 hours starting 9:30 AM on Tuesday):
```
Slot 1: 9:30-10:00 (30 min) → Off-peak → ₹300 × 0.5 × 1   = ₹150
Slot 2: 10:00-10:30 (30 min) → Peak    → ₹300 × 0.5 × 1.5 = ₹225
Slot 3: 10:30-11:00 (30 min) → Peak    → ₹300 × 0.5 × 1.5 = ₹225
Slot 4: 11:00-11:30 (30 min) → Peak    → ₹300 × 0.5 × 1.5 = ₹225
Slot 5: 11:30-12:00 (30 min) → Peak    → ₹300 × 0.5 × 1.5 = ₹225
Total: ₹1,050
```

**Timezone Handling**:
- Uses `date-fns-tz` library
- All calculations in `Asia/Kolkata` (UTC+5:30)
- Converts input times to IST before checking peak hours

#### `validation.ts` - Business Rules

**validateBookingTimes**:
- Ensures `startTime < endTime`
- Max duration: 12 hours
- Returns error message or null

**validateCancellation**:
- Checks if already cancelled
- Enforces 2-hour advance notice
- Returns error message or null

#### `datetime.ts` - Conflict Detection

**checkOverlap Algorithm**:
```typescript
function checkOverlap(
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date
): boolean {
  return newStart < existingEnd && newEnd > existingStart;
}
```

**Why this works**:
- Detects all overlapping intervals
- Allows back-to-back bookings (end == start)
- No false positives

**Examples**:
```
New:      |-----|
Existing:    |-----|  → Overlap (true)

New:      |-----|
Existing:        |-----|  → No overlap (false) - back-to-back OK

New:         |-----|
Existing:  |-----|       → Overlap (true)

New:      |-----------|
Existing:   |-----|      → Overlap (true) - contained
```

## Frontend Architecture

### Component Hierarchy

```
App
├── Navigation
│
├── Index (/)
│   └── Welcome page
│
├── Rooms (/rooms)
│   └── RoomsList
│       └── Card (shadcn-ui)
│
├── Booking (/booking)
│   └── BookingForm
│       ├── Select (room picker)
│       ├── Input (user name)
│       ├── DatePicker (date selection)
│       └── Input (time inputs)
│
└── Admin (/admin)
    ├── BookingsList
    │   └── Table (shadcn-ui)
    │       └── Cancel Button
    │
    └── AnalyticsPanel
        ├── DatePicker (from/to)
        └── Table (revenue data)
```

### State Management

- **Local State**: React `useState` for form inputs
- **Server State**: Direct API calls (no caching library needed for MVP)
- **Form State**: React Hook Form + Zod validation

### API Client (`frontend/src/services/api.ts`)

Type-safe client with error handling:
```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function fetchRooms(): Promise<Room[]>
async function createBooking(dto: CreateBookingDTO): Promise<Booking>
async function getBookings(): Promise<Booking[]>
async function cancelBooking(id: string): Promise<void>
async function getAnalytics(from: string, to: string): Promise<Analytics[]>
```

## Key Algorithms

### 1. Conflict Detection Flow

```typescript
// In BookingService.createBooking()

// 1. Get all bookings for the room
const existingBookings = storage.getBookingsByRoom(roomId);

// 2. Filter only confirmed bookings
const activeBookings = existingBookings.filter(
  b => b.status === "CONFIRMED"
);

// 3. Check each for overlap
const conflict = activeBookings.find(existing =>
  checkOverlap(
    newStartTime,
    newEndTime,
    existing.startTime,
    existing.endTime
  )
);

// 4. Reject if conflict found
if (conflict) {
  return { 
    success: false, 
    error: `Room already booked from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)}`
  };
}
```

### 2. Pricing Calculation Flow

```typescript
// In pricing.ts

function calculatePrice(baseRate, startTime, endTime) {
  let total = 0;
  let current = startTime;
  
  // Iterate in 30-minute slots
  while (current < endTime) {
    const slotEnd = min(current + 30min, endTime);
    const duration = (slotEnd - current) in hours;
    
    // Check if current slot is peak
    const multiplier = isPeakHour(current) ? 1.5 : 1;
    
    // Add slot price
    total += baseRate × duration × multiplier;
    
    current = slotEnd;
  }
  
  return Math.round(total);
}
```

### 3. Analytics Aggregation Flow

```typescript
// In AnalyticsService.getAnalytics()

// 1. Filter bookings by date range and status
const bookings = storage.getBookings().filter(
  b => b.status === "CONFIRMED" &&
       b.startTime >= fromDate &&
       b.endTime <= toDate
);

// 2. Group by room
const statsMap = new Map<roomId, { hours, revenue }>();

bookings.forEach(booking => {
  const hours = (endTime - startTime) / 3600000;
  const existing = statsMap.get(booking.roomId);
  
  statsMap.set(booking.roomId, {
    hours: existing.hours + hours,
    revenue: existing.revenue + booking.totalPrice
  });
});

// 3. Sort by revenue (highest first)
return Array.from(statsMap).sort((a, b) => 
  b.revenue - a.revenue
);
```

## Scalability Considerations

### Database Migration

**Current**: In-memory storage (development)
**Production**: PostgreSQL or MongoDB

**Migration Steps**:
1. Create database adapter implementing storage interface
2. Add connection pooling
3. Add indexes:
   - `bookings.roomId` (for conflict checks)
   - `bookings.startTime, bookings.endTime` (for range queries)
   - `bookings.status` (for analytics filtering)

**Schema Design** (PostgreSQL):
```sql
CREATE TABLE rooms (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  base_hourly_rate INTEGER NOT NULL,
  capacity INTEGER NOT NULL
);

CREATE TABLE bookings (
  booking_id VARCHAR(20) PRIMARY KEY,
  room_id VARCHAR(10) REFERENCES rooms(id),
  user_name VARCHAR(100) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  total_price INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('CONFIRMED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_room_time 
  ON bookings(room_id, start_time, end_time) 
  WHERE status = 'CONFIRMED';
```

### Performance Optimizations

**Current Bottlenecks**:
- Conflict detection: O(n) per booking (n = bookings for that room)
- Analytics: O(m) where m = total bookings

**Solutions**:
1. **Caching**: Redis for frequently accessed rooms and pricing
2. **Indexing**: B-tree indexes on time ranges
3. **Denormalization**: Pre-calculate daily/weekly analytics
4. **Read Replicas**: Separate analytics queries from transactional writes
5. **Connection Pooling**: Reuse database connections

### Future Enhancements

1. **Real-time Updates**: WebSocket for live availability
2. **Authentication**: JWT-based user sessions
3. **Authorization**: Role-based access (admin vs regular user)
4. **Rate Limiting**: Prevent API abuse
5. **Logging**: Structured logging with Winston/Pino
6. **Monitoring**: Prometheus + Grafana dashboards
7. **Testing**: Unit tests (utils), integration tests (services), E2E tests
8. **CI/CD**: GitHub Actions for automated testing and deployment

## AI Development Notes

### How AI Was Used

1. **Architecture Design**
   - Prompt: "Design a clean architecture for workspace booking with services layer"
   - AI suggested the routes → services → utils → storage pattern
   - Helped define clear boundaries between layers

2. **Pricing Logic**
   - Prompt: "Implement dynamic pricing with peak hours and 30-minute slots for IST timezone"
   - AI generated the slot-based calculation algorithm
   - Suggested using `date-fns-tz` for timezone handling

3. **Conflict Detection**
   - Prompt: "Create robust booking overlap detection allowing back-to-back bookings"
   - AI provided the mathematical overlap formula
   - Generated test cases for edge conditions

4. **TypeScript Patterns**
   - AI suggested interface-based storage for easy swapping
   - Recommended DTO pattern for API boundaries
   - Enforced strong typing throughout codebase

5. **Error Handling**
   - AI designed consistent error response format
   - Suggested validation at multiple layers (utils + services)
   - Recommended user-friendly error messages

### Prompts That Generated Key Features

**Initial System**:
> "Create a workspace booking system with dynamic pricing based on peak hours (Mon-Fri 10-13, 16-19 IST), conflict detection, and analytics. Use Node.js + Express + TypeScript with clean architecture."

**Pricing Implementation**:
> "Implement pricing calculation in 30-minute slots with 1.5x multiplier during peak hours in Asia/Kolkata timezone. Round total to nearest rupee."

**Conflict Logic**:
> "Add booking conflict detection that prevents overlaps but allows back-to-back bookings where one ends exactly when another starts."

**Analytics**:
> "Create analytics endpoint showing revenue and hours per room for a date range, excluding cancelled bookings."

### AI Limitations Encountered

1. **Timezone Edge Cases**: AI initially missed DST handling (not applicable for IST)
2. **Rounding Logic**: Required clarification on rounding per-slot vs total
3. **Cancellation Policy**: AI needed explicit instruction on 2-hour rule
4. **Type Safety**: Required iteration to ensure full TypeScript strictness

### Recommended AI Workflow

For similar projects:
1. **Start with architecture**: Get AI to design layer structure first
2. **Define models**: Clear data structures before business logic
3. **Build incrementally**: One feature at a time (rooms → bookings → pricing → analytics)
4. **Test edge cases**: Explicitly ask AI about edge cases and error conditions
5. **Refactor regularly**: Ask AI to review and suggest improvements

## Testing Strategy

### Unit Tests (Recommended)

**Utils Layer** (pure functions - easy to test):
```typescript
describe('pricing', () => {
  it('should apply peak multiplier on weekday mornings', () => {
    const start = new Date('2025-11-20T10:00:00+05:30');
    const end = new Date('2025-11-20T11:00:00+05:30');
    const price = calculatePrice(300, start, end);
    expect(price).toBe(450); // 300 × 1 × 1.5
  });
});

describe('datetime', () => {
  it('should detect overlap', () => {
    const result = checkOverlap(
      new Date('10:00'), new Date('11:00'),
      new Date('10:30'), new Date('11:30')
    );
    expect(result).toBe(true);
  });
  
  it('should allow back-to-back', () => {
    const result = checkOverlap(
      new Date('10:00'), new Date('11:00'),
      new Date('11:00'), new Date('12:00')
    );
    expect(result).toBe(false);
  });
});
```

### Integration Tests (Recommended)

**Services Layer**:
```typescript
describe('BookingService', () => {
  it('should create booking with correct price', async () => {
    const result = await bookingService.createBooking({
      roomId: '101',
      userName: 'Test',
      startTime: '2025-11-20T10:00:00Z',
      endTime: '2025-11-20T12:00:00Z'
    });
    
    expect(result.success).toBe(true);
    expect(result.data.totalPrice).toBeGreaterThan(0);
  });
});
```

### E2E Tests (Recommended)

**API Endpoints**:
```typescript
describe('POST /api/bookings', () => {
  it('should reject overlapping bookings', async () => {
    await request(app).post('/api/bookings').send(booking1);
    
    const response = await request(app)
      .post('/api/bookings')
      .send(overlappingBooking);
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('already booked');
  });
});
```

## Deployment Architecture

### Production Setup

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │   CDN/Netlify  │  (Frontend)
              │   Static Files │
              └────────┬───────┘
                       │
                       │ API Calls
                       ▼
              ┌────────────────┐
              │  Load Balancer │
              └────────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌────────┐    ┌────────┐    ┌────────┐
   │Node.js │    │Node.js │    │Node.js │  (Backend)
   │Instance│    │Instance│    │Instance│
   └────┬───┘    └────┬───┘    └────┬───┘
        │             │             │
        └─────────────┼─────────────┘
                      ▼
              ┌──────────────┐
              │  PostgreSQL  │  (Database)
              │   Primary    │
              └──────┬───────┘
                     │
              ┌──────┴───────┐
              │  PostgreSQL  │  (Read Replica)
              │   Replica    │
              └──────────────┘
```

### Environment Variables

**Backend** (`backend/.env`):
```bash
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://...  # For future migration
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

**Last Updated**: 2025-11-17  
**Version**: 1.0.0
