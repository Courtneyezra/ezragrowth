/**
 * DatePricingCalendar Component
 *
 * A calendar-based date picker that:
 * - Shows available dates based on system availability
 * - Greys out unavailable dates
 * - Supports dynamic pricing by date (for BUSY_PRO segment)
 * - Shows AM/PM slot selection
 */

import { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAvailability,
  DateAvailability,
  isDateAvailable,
  getDateSlots,
  getUnavailableReason,
} from "@/hooks/useAvailability";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DatePricingCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  selectedSlot?: "am" | "pm" | "full";
  onSelectSlot?: (slot: "am" | "pm" | "full") => void;
  postcode?: string;
  serviceIds?: string[];
  minDate?: Date;
  showSlotSelector?: boolean;
  className?: string;
}

export function DatePricingCalendar({
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  postcode,
  serviceIds,
  minDate = new Date(),
  showSlotSelector = true,
  className,
}: DatePricingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch availability data
  const { data: availabilityData, isLoading } = useAvailability({
    days: 60, // Fetch 2 months
    postcode,
    serviceIds,
  });

  const availability = availabilityData?.dates;

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days for the first week
    const startPadding = getDay(monthStart);
    const paddingDays: (Date | null)[] = Array(startPadding).fill(null);

    return [...paddingDays, ...days];
  }, [currentMonth]);

  // Get available slots for selected date
  const selectedDateSlots = useMemo(() => {
    if (!selectedDate || !availability) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return getDateSlots(availability, dateStr);
  }, [selectedDate, availability]);

  // Check if date is selectable
  const isDateSelectable = (date: Date): boolean => {
    if (isBefore(startOfDay(date), startOfDay(minDate))) return false;

    if (!availability) return true; // Allow selection while loading

    const dateStr = format(date, "yyyy-MM-dd");
    return isDateAvailable(availability, dateStr);
  };

  // Get tooltip content for unavailable dates
  const getTooltipContent = (date: Date): string | null => {
    if (!availability) return null;

    const dateStr = format(date, "yyyy-MM-dd");
    const reason = getUnavailableReason(availability, dateStr);

    if (reason) return reason;
    if (isBefore(startOfDay(date), startOfDay(minDate))) return "Date is in the past";

    return null;
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;
    onSelectDate(date);

    // Auto-select first available slot
    if (onSelectSlot && !selectedSlot) {
      const dateStr = format(date, "yyyy-MM-dd");
      const slots = getDateSlots(availability, dateStr);
      if (slots.length > 0) {
        onSelectSlot(slots.includes("full") ? "full" : slots[0]);
      }
    }
  };

  // Navigate months
  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <TooltipProvider>
      <div className={cn("bg-gray-800 rounded-xl p-4 border border-gray-700", className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>

          <h3 className="text-lg font-semibold text-white">
            {format(currentMonth, "MMMM yyyy")}
          </h3>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = format(day, "yyyy-MM-dd");
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const selectable = isDateSelectable(day);
            const dayIsToday = isToday(day);
            const tooltipContent = getTooltipContent(day);

            const dayButton = (
              <button
                onClick={() => handleDateClick(day)}
                disabled={!selectable}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative",
                  selectable && !isSelected && "hover:bg-gray-700 text-white",
                  !selectable && "text-gray-600 cursor-not-allowed",
                  isSelected && "bg-yellow-500 text-gray-900 font-semibold",
                  dayIsToday && !isSelected && "ring-1 ring-yellow-500/50"
                )}
              >
                <span>{format(day, "d")}</span>
                {/* Availability indicator */}
                {availability && selectable && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500" />
                )}
              </button>
            );

            if (tooltipContent) {
              return (
                <Tooltip key={dateStr}>
                  <TooltipTrigger asChild>{dayButton}</TooltipTrigger>
                  <TooltipContent>
                    <p>{tooltipContent}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={dateStr}>{dayButton}</div>;
          })}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Loading availability...
          </div>
        )}

        {/* Selected date display */}
        {selectedDate && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-white mb-3">
              <Calendar className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </span>
            </div>

            {/* Time slot selector */}
            {showSlotSelector && selectedDateSlots.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Select a time slot:</span>
                </div>
                <div className="flex gap-2">
                  {selectedDateSlots.includes("am") && (
                    <button
                      onClick={() => onSelectSlot?.("am")}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition",
                        selectedSlot === "am"
                          ? "bg-yellow-500 text-gray-900"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      )}
                    >
                      Morning (8am-12pm)
                    </button>
                  )}
                  {selectedDateSlots.includes("pm") && (
                    <button
                      onClick={() => onSelectSlot?.("pm")}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition",
                        selectedSlot === "pm"
                          ? "bg-yellow-500 text-gray-900"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      )}
                    >
                      Afternoon (12pm-5pm)
                    </button>
                  )}
                  {selectedDateSlots.includes("full") && !selectedDateSlots.includes("am") && (
                    <button
                      onClick={() => onSelectSlot?.("full")}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition",
                        selectedSlot === "full"
                          ? "bg-yellow-500 text-gray-900"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      )}
                    >
                      Any Time
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-600" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default DatePricingCalendar;
