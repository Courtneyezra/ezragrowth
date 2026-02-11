/**
 * useAvailability Hook
 *
 * Fetches system-wide availability data for date pickers.
 * Used by quote pages to show available booking dates.
 */

import { useQuery } from "@tanstack/react-query";

export interface DateAvailability {
  date: string; // "YYYY-MM-DD"
  isAvailable: boolean;
  reason?: "master_blocked" | "day_inactive" | "no_contractors" | "available";
  slots: ("am" | "pm" | "full")[];
  contractorCount?: number;
  isWeekend?: boolean;
}

export interface AvailabilityResponse {
  dates: DateAvailability[];
}

export interface UseAvailabilityOptions {
  days?: number;
  postcode?: string;
  serviceIds?: string[];
  enabled?: boolean;
}

/**
 * Hook to fetch availability data for date pickers
 */
export function useAvailability(options: UseAvailabilityOptions = {}) {
  const { days = 28, postcode, serviceIds, enabled = true } = options;

  // Build query params
  const params = new URLSearchParams();
  if (days) params.set("days", days.toString());
  if (postcode) params.set("postcode", postcode);
  if (serviceIds?.length) params.set("serviceIds", serviceIds.join(","));

  return useQuery<AvailabilityResponse>({
    queryKey: ["publicAvailability", days, postcode, serviceIds?.join(",")],
    queryFn: async () => {
      const response = await fetch(`/api/availability/public?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }
      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Utility to check if a specific date is available
 */
export function isDateAvailable(
  availability: DateAvailability[] | undefined,
  dateStr: string
): boolean {
  if (!availability) return false;
  const date = availability.find((d) => d.date === dateStr);
  return date?.isAvailable ?? false;
}

/**
 * Utility to get available slots for a specific date
 */
export function getDateSlots(
  availability: DateAvailability[] | undefined,
  dateStr: string
): ("am" | "pm" | "full")[] {
  if (!availability) return [];
  const date = availability.find((d) => d.date === dateStr);
  return date?.slots ?? [];
}

/**
 * Utility to get reason why a date is unavailable
 */
export function getUnavailableReason(
  availability: DateAvailability[] | undefined,
  dateStr: string
): string | undefined {
  if (!availability) return undefined;
  const date = availability.find((d) => d.date === dateStr);
  if (!date || date.isAvailable) return undefined;

  switch (date.reason) {
    case "master_blocked":
      return "Blocked";
    case "day_inactive":
      return "Closed";
    case "no_contractors":
      return "No availability";
    default:
      return "Unavailable";
  }
}

export default useAvailability;
