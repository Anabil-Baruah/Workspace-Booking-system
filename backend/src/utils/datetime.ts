import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "Asia/Kolkata";

export function formatTime(date: Date): string {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, "h:mm a");
}

export function checkOverlap(
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date
): boolean {
  return newStart < existingEnd && newEnd > existingStart;
}
