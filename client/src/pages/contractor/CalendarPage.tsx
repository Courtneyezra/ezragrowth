/**
 * Contractor Calendar Page
 *
 * Allows contractors to:
 * - View their monthly calendar
 * - Toggle AM/PM/Full Day availability
 * - See booked jobs overlaid on calendar
 * - Quick holiday/available toggles
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  getDay,
  isBefore,
  startOfDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Sun,
  Moon,
  Check,
  X,
  Loader2,
  Briefcase,
  Umbrella,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ContractorAppShell from "@/components/layout/ContractorAppShell";

interface WeeklyPattern {
  id: string;
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
}

interface DateOverride {
  id: string;
  date: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

interface Job {
  id: string;
  scheduledDate: string;
  scheduledTime?: string;
  status: string;
  customerName?: string;
  address?: string;
}

interface ContractorAvailabilityData {
  weeklyPattern: WeeklyPattern[];
  dateOverrides: DateOverride[];
  jobs: Job[];
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Mock contractor ID for now - in production, get from auth context
const CONTRACTOR_ID = "demo-contractor";

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(addMonths(currentMonth, 1));

  // Fetch contractor availability
  const { data, isLoading, error } = useQuery<ContractorAvailabilityData>({
    queryKey: ["contractorAvailability", CONTRACTOR_ID, format(monthStart, "yyyy-MM")],
    queryFn: () =>
      fetch(
        `/api/availability/contractor/${CONTRACTOR_ID}?start=${format(monthStart, "yyyy-MM-dd")}&end=${format(monthEnd, "yyyy-MM-dd")}`
      ).then((r) => r.json()),
  });

  // Toggle availability mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ date }: { date: string }) => {
      const response = await fetch(`/api/availability/contractor/${CONTRACTOR_ID}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      if (!response.ok) throw new Error("Failed to toggle");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractorAvailability"] });
    },
  });

  // Set specific availability mutation
  const setAvailabilityMutation = useMutation({
    mutationFn: async ({
      date,
      isAvailable,
      startTime,
      endTime,
    }: {
      date: string;
      isAvailable: boolean;
      startTime?: string;
      endTime?: string;
    }) => {
      const response = await fetch(`/api/availability/contractor/${CONTRACTOR_ID}/date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, isAvailable, startTime, endTime }),
      });
      if (!response.ok) throw new Error("Failed to set availability");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractorAvailability"] });
      setSelectedDate(null);
    },
  });

  // Calendar days
  const calendarDays = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) });
    const startPadding = getDay(monthStart);
    const paddingDays: (Date | null)[] = Array(startPadding).fill(null);
    return [...paddingDays, ...days];
  }, [currentMonth, monthStart]);

  // Lookups
  const weeklyPatternMap = useMemo(() => {
    const map = new Map<number, WeeklyPattern>();
    data?.weeklyPattern.forEach((p) => map.set(p.dayOfWeek, p));
    return map;
  }, [data]);

  const dateOverrideMap = useMemo(() => {
    const map = new Map<string, DateOverride>();
    data?.dateOverrides.forEach((o) => map.set(format(new Date(o.date), "yyyy-MM-dd"), o));
    return map;
  }, [data]);

  const jobsByDate = useMemo(() => {
    const map = new Map<string, Job[]>();
    data?.jobs.forEach((j) => {
      if (j.scheduledDate) {
        const dateStr = format(new Date(j.scheduledDate), "yyyy-MM-dd");
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr)!.push(j);
      }
    });
    return map;
  }, [data]);

  // Get availability status for a date
  const getDateStatus = (date: Date): { available: boolean; slots: string[]; hasOverride: boolean } => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = getDay(date);

    // Check for override first
    const override = dateOverrideMap.get(dateStr);
    if (override) {
      return {
        available: override.isAvailable,
        slots: override.isAvailable ? getSlots(override.startTime, override.endTime) : [],
        hasOverride: true,
      };
    }

    // Fall back to weekly pattern
    const pattern = weeklyPatternMap.get(dayOfWeek);
    if (pattern?.isActive) {
      return {
        available: true,
        slots: getSlots(pattern.startTime, pattern.endTime),
        hasOverride: false,
      };
    }

    return { available: false, slots: [], hasOverride: false };
  };

  // Get slots from time range
  const getSlots = (start?: string, end?: string): string[] => {
    if (!start || !end) return ["full"];
    const startHour = parseInt(start.split(":")[0]);
    const endHour = parseInt(end.split(":")[0]);

    if (startHour < 12 && endHour > 12) return ["full"];
    if (startHour < 12) return ["am"];
    return ["pm"];
  };

  // Handle date tap
  const handleDateTap = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateStr);
    }
  };

  // Quick actions
  const setAvailableAllWeek = () => {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = format(addMonths(today, 0), "yyyy-MM-dd");
      // Would batch these in production
    }
  };

  const selectedDateStatus = selectedDate
    ? getDateStatus(new Date(selectedDate))
    : null;
  const selectedDateJobs = selectedDate ? jobsByDate.get(selectedDate) || [] : [];

  return (
    <ContractorAppShell>
      <div className="px-4 pt-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#323338]">My Schedule</h1>
            <p className="text-sm text-gray-500">Manage your availability</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => {
              const today = format(new Date(), "yyyy-MM-dd");
              toggleMutation.mutate({ date: today });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-sm font-medium whitespace-nowrap"
          >
            <Sun className="h-4 w-4 text-yellow-500" />
            Toggle Today
          </button>
          <button
            onClick={() => {
              // Mark week as holiday
              // In production, would open a date range picker
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-sm font-medium whitespace-nowrap"
          >
            <Umbrella className="h-4 w-4 text-blue-500" />
            Set Holiday
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-50 rounded-full transition"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            <h2 className="text-lg font-semibold text-[#323338]">
              {format(currentMonth, "MMMM yyyy")}
            </h2>

            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-50 rounded-full transition"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAY_NAMES.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square border-r border-b border-gray-50"
                    />
                  );
                }

                const dateStr = format(day, "yyyy-MM-dd");
                const status = getDateStatus(day);
                const jobs = jobsByDate.get(dateStr) || [];
                const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                const dayIsToday = isToday(day);
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => !isPast && handleDateTap(dateStr)}
                    disabled={isPast}
                    className={cn(
                      "aspect-square p-1 border-r border-b border-gray-50 relative flex flex-col transition-all",
                      isPast && "opacity-40",
                      isSelected && "bg-[#6C6CFF]/10 ring-2 ring-[#6C6CFF] ring-inset",
                      dayIsToday && !isSelected && "bg-yellow-50"
                    )}
                  >
                    {/* Date number */}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        dayIsToday && "text-[#6C6CFF] font-bold",
                        !status.available && !isPast && "text-gray-400"
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Availability indicator */}
                    <div className="flex-1 flex items-end justify-center pb-1">
                      {status.available ? (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      ) : (
                        !isPast && <div className="w-2 h-2 rounded-full bg-gray-300" />
                      )}
                    </div>

                    {/* Job indicator */}
                    {jobs.length > 0 && (
                      <div className="absolute top-1 right-1">
                        <div className="w-4 h-4 rounded-full bg-[#6C6CFF] text-white text-[10px] flex items-center justify-center font-bold">
                          {jobs.length}
                        </div>
                      </div>
                    )}

                    {/* Override indicator */}
                    {status.hasOverride && (
                      <div className="absolute bottom-1 right-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span>Off</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-[#6C6CFF] text-white text-[10px] flex items-center justify-center font-bold">
              1
            </div>
            <span>Jobs</span>
          </div>
        </div>

        {/* Selected Date Panel */}
        {selectedDate && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#323338]">
                  {format(new Date(selectedDate), "EEEE, MMMM d")}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedDateStatus?.available ? "Available" : "Not available"}
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-gray-50 rounded-full"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Jobs on this date */}
            {selectedDateJobs.length > 0 && (
              <div className="mb-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Scheduled Jobs</h4>
                {selectedDateJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#6C6CFF]/10 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-[#6C6CFF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#323338] truncate">
                        {job.customerName || "Customer"}
                      </p>
                      {job.scheduledTime && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.scheduledTime}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        job.status === "pending" && "bg-yellow-100 text-yellow-700",
                        job.status === "accepted" && "bg-green-100 text-green-700",
                        job.status === "in_progress" && "bg-blue-100 text-blue-700"
                      )}
                    >
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Availability Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-600">Set Availability</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    setAvailabilityMutation.mutate({
                      date: selectedDate,
                      isAvailable: true,
                      startTime: "08:00",
                      endTime: "12:00",
                    })
                  }
                  disabled={setAvailabilityMutation.isPending}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border transition",
                    selectedDateStatus?.slots.includes("am")
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Sun className="h-4 w-4" />
                  <span className="text-sm font-medium">Morning</span>
                </button>
                <button
                  onClick={() =>
                    setAvailabilityMutation.mutate({
                      date: selectedDate,
                      isAvailable: true,
                      startTime: "12:00",
                      endTime: "17:00",
                    })
                  }
                  disabled={setAvailabilityMutation.isPending}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border transition",
                    selectedDateStatus?.slots.includes("pm")
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Moon className="h-4 w-4" />
                  <span className="text-sm font-medium">Afternoon</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    setAvailabilityMutation.mutate({
                      date: selectedDate,
                      isAvailable: true,
                      startTime: "08:00",
                      endTime: "17:00",
                    })
                  }
                  disabled={setAvailabilityMutation.isPending}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border transition",
                    selectedDateStatus?.available && selectedDateStatus?.slots.includes("full")
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">Full Day</span>
                </button>
                <button
                  onClick={() =>
                    setAvailabilityMutation.mutate({
                      date: selectedDate,
                      isAvailable: false,
                    })
                  }
                  disabled={setAvailabilityMutation.isPending}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl border transition",
                    !selectedDateStatus?.available
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <X className="h-4 w-4" />
                  <span className="text-sm font-medium">Day Off</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ContractorAppShell>
  );
}
