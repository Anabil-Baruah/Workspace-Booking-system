import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "Asia/Kolkata";
const PEAK_MULTIPLIER = 1.5;

interface PeakHourRange {
  start: number;
  end: number;
}

const PEAK_HOURS: PeakHourRange[] = [
  { start: 10, end: 13 }, // 10:00-13:00
  { start: 16, end: 19 }, // 16:00-19:00
];

function isPeakHour(date: Date): boolean {
  const zonedDate = toZonedTime(date, TIMEZONE);
  const hour = zonedDate.getHours();
  const day = zonedDate.getDay();

  // Weekend check (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) return false;

  // Check if hour falls in peak ranges
  return PEAK_HOURS.some((range) => hour >= range.start && hour < range.end);
}

export function calculatePrice(
  baseHourlyRate: number,
  startTime: Date,
  endTime: Date
): number {
  let totalPrice = 0;
  
  // Calculate in 30-minute slots
  const SLOT_MINUTES = 30;
  const currentTime = new Date(startTime);
  
  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime.getTime() + SLOT_MINUTES * 60 * 1000);
    const actualSlotEnd = slotEnd > endTime ? endTime : slotEnd;
    
    const slotDurationHours = (actualSlotEnd.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    
    const multiplier = isPeakHour(currentTime) ? PEAK_MULTIPLIER : 1;
    totalPrice += baseHourlyRate * slotDurationHours * multiplier;
    
    currentTime.setTime(actualSlotEnd.getTime());
  }
  
  return Math.round(totalPrice);
}
