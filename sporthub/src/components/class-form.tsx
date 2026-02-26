"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { SPORT_TYPES } from "@/lib/sport-types";
import type { SportType } from "@prisma/client";

const HOURS_START = Array.from({ length: 18 }, (_, i) => i + 6); // 6–23
const HOURS_END = Array.from({ length: 19 }, (_, i) => i + 6);   // 6–24
const MINUTES = [0, 15, 30, 45];

function dateToParts(d: Date, isEnd: boolean): { date: string; hour: number; min: number } {
  const hour = d.getHours();
  const min = d.getMinutes();
  const nearestMin = MINUTES.reduce((a, b) => (Math.abs(b - min) < Math.abs(a - min) ? b : a));
  let h = Math.max(6, Math.min(23, hour));
  if (isEnd && (hour === 23 && min >= 45 || hour === 0)) h = 24;
  return {
    date: d.toISOString().slice(0, 10),
    hour: h,
    min: h === 24 ? 45 : nearestMin,
  };
}

function partsToDate(dateStr: string, hour: number, min: number): Date {
  const d = new Date(dateStr + "T00:00:00");
  if (hour === 24) {
    d.setHours(23, 59, 0, 0);
  } else {
    d.setHours(hour, min, 0, 0);
  }
  return d;
}

type ClassFormProps =
  | { organisationId: string; classId?: undefined }
  | { organisationId?: undefined; classId: string };

export function ClassForm(props: ClassFormProps) {
  const router = useRouter();
  const isEdit = !!props.classId;

  const { data: editData, isLoading: loadingEdit } = trpc.organiser.getClassForEdit.useQuery(
    { id: props.classId! },
    { enabled: isEdit }
  );
  const orgIdForLocations = isEdit ? editData?.organiser.organisationId : props.organisationId;
  const { data: orgData, isLoading: loadingOrg } = trpc.organiser.getOrgWithLocations.useQuery(
    { organisationId: orgIdForLocations! },
    { enabled: !!orgIdForLocations }
  );

  const createClass = trpc.organiser.createClass.useMutation({
    onSuccess: () => router.push(`/organiser/classes?org=${props.organisationId}`),
  });
  const updateClass = trpc.organiser.updateClass.useMutation({
    onSuccess: () => {
      router.push("/organiser/classes");
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sportType, setSportType] = useState<SportType>("PADEL");
  const [startDate, setStartDate] = useState("");
  const [startHour, setStartHour] = useState(9);
  const [startMin, setStartMin] = useState(0);
  const [endDate, setEndDate] = useState("");
  const [endHour, setEndHour] = useState(10);
  const [endMin, setEndMin] = useState(0);
  const [capacity, setCapacity] = useState(10);
  const [locationId, setLocationId] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(false);

  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setDescription(editData.description ?? "");
      setSportType(editData.sportType);
      const startParts = dateToParts(editData.startTime, false);
      const endParts = dateToParts(editData.endTime, true);
      setStartDate(startParts.date);
      setStartHour(startParts.hour);
      setStartMin(startParts.min);
      setEndDate(endParts.date);
      setEndHour(endParts.hour);
      setEndMin(endParts.min);
      setCapacity(editData.capacity);
      setLocationId(editData.locationId);
      setPriceCents(editData.priceCents != null ? String(Math.round(editData.priceCents / 100)) : "");
      setPaymentRequired(editData.paymentRequired);
    }
  }, [editData]);

  useEffect(() => {
    if (!isEdit && orgData?.organisation.locations.length && !locationId) {
      setLocationId(orgData.organisation.locations[0].id);
    }
  }, [isEdit, orgData, locationId]);

  useEffect(() => {
    if (!isEdit && !editData && !startDate) {
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setEndDate(today);
    }
  }, [isEdit, editData, startDate]);

  const locations = orgData?.organisation.locations ?? (isEdit && editData ? [editData.location] : []);
  const organisationId = isEdit ? editData?.organiser.organisationId : props.organisationId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = partsToDate(startDate, startHour, startMin);
    const end = partsToDate(endDate, endHour, endMin);
    const payload = {
      locationId,
      title: title.trim(),
      description: description.trim() || undefined,
      sportType,
      startTime: start,
      endTime: end,
      capacity,
      priceCents: priceCents ? Math.round(Number(priceCents) * 100) : undefined,
      paymentRequired,
    };
    if (isEdit && props.classId) {
      updateClass.mutate({ id: props.classId, ...payload });
    } else if (organisationId) {
      createClass.mutate({ organisationId, ...payload });
    }
  };

  const isPending = createClass.isPending || updateClass.isPending;
  const error = createClass.error ?? updateClass.error;

  if (isEdit && loadingEdit) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!isEdit && loadingOrg) return <p className="text-sm text-gray-500">Loading…</p>;
  if (isEdit && !editData) return <p className="text-sm text-red-600">Class not found.</p>;
  if (!isEdit && (!orgData?.organisation.locations.length)) {
    return (
      <p className="text-sm text-amber-700">
        Add at least one location in{" "}
        <Link href={`/organiser/locations?org=${props.organisationId}`} className="font-medium underline">
          Locations
        </Link>{" "}
        before creating a class.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="sportType" className="block text-sm font-medium text-gray-700">
          Sport type *
        </label>
        <select
          id="sportType"
          value={sportType}
          onChange={(e) => setSportType(e.target.value as SportType)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {SPORT_TYPES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">
          Location *
        </label>
        <select
          id="locationId"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select location</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} — {loc.city}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Date & time *
        </label>
        <p className="mt-0.5 text-xs text-gray-500">Hours 6–24 (24 = end of day). Minutes: 0, 15, 30, 45.</p>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-500">Start</span>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                aria-label="Start hour"
              >
                {HOURS_START.map((h) => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
              <select
                value={startMin}
                onChange={(e) => setStartMin(Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                aria-label="Start minute"
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-500">End</span>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                aria-label="End hour"
              >
                {HOURS_END.map((h) => (
                  <option key={h} value={h}>{h === 24 ? "24 (midnight)" : `${h}:00`}</option>
                ))}
              </select>
              <select
                value={endMin}
                onChange={(e) => setEndMin(Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                aria-label="End minute"
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <label className="flex cursor-not-allowed items-center gap-2 opacity-75">
          <input
            type="checkbox"
            disabled
            checked={false}
            readOnly
            className="rounded border-gray-300"
            aria-describedby="regular-coming-soon"
          />
          <span className="text-sm font-medium text-gray-700">Regular class (recurring)</span>
          <span id="regular-coming-soon" className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
            Coming soon
          </span>
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Repeat on specific days (e.g. every Monday & Wednesday). Single events only for now.
        </p>
      </div>
      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
          Capacity *
        </label>
        <input
          id="capacity"
          type="number"
          min={1}
          max={1000}
          required
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={paymentRequired}
            onChange={(e) => setPaymentRequired(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Payment required at venue</span>
        </label>
      </div>
      <div>
        <label htmlFor="priceCents" className="block text-sm font-medium text-gray-700">
          Price (EUR, optional)
        </label>
        <input
          id="priceCents"
          type="number"
          min={0}
          step={0.01}
          value={priceCents}
          onChange={(e) => setPriceCents(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="e.g. 15.00"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error.message}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Create class (draft)"}
        </button>
        {isEdit && props.classId && (
          <Link
            href="/organiser/classes"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
