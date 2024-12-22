import { DateRangeDto } from "../dto/date-range.dto";

export function validateDateRange(dateRange?: DateRangeDto): DateRangeDto {
  if (!dateRange) return {};

  const { startDate, endDate } = dateRange;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error("Start date cannot be after end date");
  }

  return dateRange;
}

export function isWithinDateRange(
  date: Date,
  dateRange?: DateRangeDto
): boolean {
  if (!dateRange) return true;

  const { startDate, endDate } = dateRange;
  const timestamp = date.getTime();

  if (startDate && timestamp < new Date(startDate).getTime()) return false;
  if (endDate && timestamp > new Date(endDate).getTime()) return false;

  return true;
}
