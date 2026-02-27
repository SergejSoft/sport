"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { Booking, Activity } from "./data";
import { initialBookings } from "./data";

type BookingStore = {
  bookings: Booking[];
  listeners: Set<() => void>;
};

const store: BookingStore = {
  bookings: initialBookings,
  listeners: new Set(),
};

function emitChange() {
  for (const listener of store.listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

function getSnapshot() {
  return store.bookings;
}

function getServerSnapshot() {
  return initialBookings;
}

export function useBookings() {
  const bookings = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const addBooking = useCallback((activity: Activity) => {
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      activity,
      status: "upcoming",
      bookedAt: new Date().toISOString(),
    };
    store.bookings = [newBooking, ...store.bookings];
    emitChange();
  }, []);

  const cancelBooking = useCallback((bookingId: string) => {
    store.bookings = store.bookings.map((b) =>
      b.id === bookingId ? { ...b, status: "cancelled" as const } : b
    );
    emitChange();
  }, []);

  const isBooked = useCallback(
    (activityId: string) => {
      return bookings.some(
        (b) => b.activity.id === activityId && b.status === "upcoming"
      );
    },
    [bookings]
  );

  return { bookings, addBooking, cancelBooking, isBooked };
}
