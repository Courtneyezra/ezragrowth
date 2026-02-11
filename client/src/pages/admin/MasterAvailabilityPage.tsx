/**
 * Master Availability Page
 *
 * Admin page for managing system-wide availability:
 * - View full calendar with availability status
 * - Toggle blocked dates
 * - Manage weekly operating hours
 * - See contractor availability counts
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
  isSameMonth,
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
  Users,
  Ban,
  Check,
  X,
  Loader2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarDate {
  date: string;
  masterBlocked: boolean;
  masterBlockedReason?: string;
  dayActive: boolean;
  contractorCount: number;
  bookingCount: number;
  slots: { am: number; pm: number };
}

interface MasterPattern {
  id: string;
  dayOfWeek: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
}

interface BlockedDate {
  id: string;
  date: string;
  reason?: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBREVIATIONS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function MasterAvailabilityPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showPatternDialog, setShowPatternDialog] = useState(false);

  const monthStr = format(currentMonth, "yyyy-MM");

  // Fetch calendar data
  const { data: calendarData, isLoading: calendarLoading } = useQuery<{ dates: CalendarDate[] }>({
    queryKey: ["adminCalendar", monthStr],
    queryFn: () =>
      fetch(`/api/availability/admin/calendar?month=${monthStr}`).then((r) => r.json()),
  });

  // Fetch master pattern
  const { data: patternData, isLoading: patternLoading } = useQuery<{ pattern: MasterPattern[] }>({
    queryKey: ["masterPattern"],
    queryFn: () => fetch("/api/availability/admin/master").then((r) => r.json()),
  });

  // Fetch blocked dates
  const { data: blockedData } = useQuery<{ blockedDates: BlockedDate[] }>({
    queryKey: ["blockedDates", monthStr],
    queryFn: () => {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(addMonths(currentMonth, 2)), "yyyy-MM-dd");
      return fetch(`/api/availability/admin/blocked?start=${start}&end=${end}`).then((r) => r.json());
    },
  });

  // Toggle block mutation
  const toggleBlockMutation = useMutation({
    mutationFn: async ({ date, reason }: { date: string; reason?: string }) => {
      const response = await fetch("/api/availability/admin/blocked/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, reason }),
      });
      if (!response.ok) throw new Error("Failed to toggle");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["blockedDates"] });
      toast({
        title: data.action === "blocked" ? "Date Blocked" : "Date Unblocked",
        description: `Successfully ${data.action} the date.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update blocked date.",
        variant: "destructive",
      });
    },
  });

  // Update pattern mutation
  const updatePatternMutation = useMutation({
    mutationFn: async ({
      dayOfWeek,
      isActive,
      startTime,
      endTime,
    }: {
      dayOfWeek: number;
      isActive?: boolean;
      startTime?: string;
      endTime?: string;
    }) => {
      const response = await fetch(`/api/availability/admin/master/${dayOfWeek}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive, startTime, endTime }),
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masterPattern"] });
      queryClient.invalidateQueries({ queryKey: ["adminCalendar"] });
      toast({
        title: "Pattern Updated",
        description: "Operating hours updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update operating hours.",
        variant: "destructive",
      });
    },
  });

  // Calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const startPadding = getDay(monthStart);
    const paddingDays: (Date | null)[] = Array(startPadding).fill(null);

    return [...paddingDays, ...days];
  }, [currentMonth]);

  // Calendar data lookup
  const calendarLookup = useMemo(() => {
    const lookup = new Map<string, CalendarDate>();
    calendarData?.dates.forEach((d) => lookup.set(d.date, d));
    return lookup;
  }, [calendarData]);

  // Handle date click
  const handleDateClick = (dateStr: string) => {
    const dateData = calendarLookup.get(dateStr);
    if (!dateData?.dayActive) {
      toast({
        title: "Day Inactive",
        description: "This day is not an operating day. Update the weekly pattern to enable.",
      });
      return;
    }

    setSelectedDate(dateStr);
    setBlockReason(dateData?.masterBlockedReason || "");
    setShowBlockDialog(true);
  };

  // Handle block toggle
  const handleBlockToggle = () => {
    if (!selectedDate) return;
    toggleBlockMutation.mutate({ date: selectedDate, reason: blockReason || undefined });
    setShowBlockDialog(false);
    setSelectedDate(null);
    setBlockReason("");
  };

  // Get cell color
  const getCellColor = (dateData?: CalendarDate) => {
    if (!dateData) return "bg-gray-800";
    if (!dateData.dayActive) return "bg-gray-900 text-gray-600";
    if (dateData.masterBlocked) return "bg-red-900/50 border-red-700";
    if (dateData.contractorCount === 0) return "bg-yellow-900/30 border-yellow-700";
    return "bg-green-900/30 border-green-700";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Master Calendar</h1>
            <p className="text-muted-foreground">
              Manage system-wide availability and operating hours
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowPatternDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Operating Hours
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-900/50 border border-green-700" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-red-900/50 border border-red-700" />
            <span className="text-muted-foreground">Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-yellow-900/30 border border-yellow-700" />
            <span className="text-muted-foreground">No Contractors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-gray-900" />
            <span className="text-muted-foreground">Closed</span>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-muted rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>

            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-muted rounded-lg transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAY_ABBREVIATIONS.map((day, i) => (
              <div
                key={day}
                className={cn(
                  "py-3 text-center text-sm font-medium",
                  i === 0 || i === 6 ? "text-muted-foreground/50" : "text-muted-foreground"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {calendarLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square border-r border-b border-border" />;
                }

                const dateStr = format(day, "yyyy-MM-dd");
                const dateData = calendarLookup.get(dateStr);
                const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                const dayIsToday = isToday(day);

                return (
                  <Tooltip key={dateStr}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => !isPast && handleDateClick(dateStr)}
                        disabled={isPast}
                        className={cn(
                          "aspect-square p-2 border-r border-b border-border transition-all relative flex flex-col",
                          getCellColor(dateData),
                          isPast && "opacity-50 cursor-not-allowed",
                          !isPast && "hover:opacity-80 cursor-pointer",
                          dayIsToday && "ring-2 ring-primary ring-inset"
                        )}
                      >
                        <span className="text-sm font-medium">{format(day, "d")}</span>

                        {dateData && dateData.dayActive && (
                          <div className="flex-1 flex flex-col justify-end gap-0.5">
                            {/* Contractor count */}
                            {dateData.contractorCount > 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                <Users className="h-3 w-3" />
                                <span>{dateData.contractorCount}</span>
                              </div>
                            )}

                            {/* Booking count */}
                            {dateData.bookingCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-blue-400">
                                <Calendar className="h-3 w-3" />
                                <span>{dateData.bookingCount}</span>
                              </div>
                            )}

                            {/* Blocked indicator */}
                            {dateData.masterBlocked && (
                              <div className="absolute top-1 right-1">
                                <Ban className="h-3 w-3 text-red-500" />
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-medium">{format(day, "EEEE, MMMM d")}</p>
                        {dateData && (
                          <>
                            {!dateData.dayActive && <p className="text-muted-foreground">Closed</p>}
                            {dateData.masterBlocked && (
                              <p className="text-red-400">
                                Blocked{dateData.masterBlockedReason && `: ${dateData.masterBlockedReason}`}
                              </p>
                            )}
                            {dateData.dayActive && !dateData.masterBlocked && (
                              <>
                                <p>{dateData.contractorCount} contractors available</p>
                                <p>{dateData.bookingCount} bookings</p>
                                <p className="text-xs text-muted-foreground">
                                  AM: {dateData.slots.am} | PM: {dateData.slots.pm}
                                </p>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Blocked Dates */}
        {blockedData && blockedData.blockedDates.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-500" />
              Upcoming Blocked Dates
            </h3>
            <div className="space-y-2">
              {blockedData.blockedDates.slice(0, 5).map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg"
                >
                  <div>
                    <span className="font-medium">
                      {format(new Date(blocked.date), "EEE, MMM d, yyyy")}
                    </span>
                    {blocked.reason && (
                      <span className="text-muted-foreground ml-2">- {blocked.reason}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDate(format(new Date(blocked.date), "yyyy-MM-dd"));
                      setBlockReason("");
                      toggleBlockMutation.mutate({ date: format(new Date(blocked.date), "yyyy-MM-dd") });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block Date Dialog */}
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDate && calendarLookup.get(selectedDate)?.masterBlocked
                  ? "Unblock Date"
                  : "Block Date"}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-muted-foreground mb-4">
                {selectedDate && format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
              </p>

              {selectedDate && !calendarLookup.get(selectedDate)?.masterBlocked && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Input
                    id="reason"
                    placeholder="e.g., Bank Holiday"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBlockToggle}
                disabled={toggleBlockMutation.isPending}
                variant={
                  selectedDate && calendarLookup.get(selectedDate)?.masterBlocked
                    ? "default"
                    : "destructive"
                }
              >
                {toggleBlockMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {selectedDate && calendarLookup.get(selectedDate)?.masterBlocked
                  ? "Unblock"
                  : "Block Date"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Operating Hours Dialog */}
        <Dialog open={showPatternDialog} onOpenChange={setShowPatternDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Operating Hours</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {patternLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                patternData?.pattern.map((day) => (
                  <div
                    key={day.dayOfWeek}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={day.isActive}
                        onCheckedChange={(checked) =>
                          updatePatternMutation.mutate({
                            dayOfWeek: day.dayOfWeek,
                            isActive: checked,
                          })
                        }
                      />
                      <span className={cn("font-medium", !day.isActive && "text-muted-foreground")}>
                        {DAY_NAMES[day.dayOfWeek]}
                      </span>
                    </div>

                    {day.isActive && (
                      <div className="flex items-center gap-2 text-sm">
                        <Input
                          type="time"
                          value={day.startTime}
                          onChange={(e) =>
                            updatePatternMutation.mutate({
                              dayOfWeek: day.dayOfWeek,
                              startTime: e.target.value,
                            })
                          }
                          className="w-24 h-8"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={day.endTime}
                          onChange={(e) =>
                            updatePatternMutation.mutate({
                              dayOfWeek: day.dayOfWeek,
                              endTime: e.target.value,
                            })
                          }
                          className="w-24 h-8"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowPatternDialog(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
