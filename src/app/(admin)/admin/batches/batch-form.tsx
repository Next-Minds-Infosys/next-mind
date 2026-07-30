"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { batchSchema, type BatchFormValues, type BatchInput } from "@/lib/schemas";
import { createBatch, updateBatch } from "./actions";

interface Props {
  courses: { id: string; title: string }[];
  instructors: { id: string; name: string | null; email: string }[];
  initial?: BatchInput & { id: string };
  onDone?: () => void;
}

const input =
  "w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm ring-1 ring-gray-950/5 focus:outline-none focus:ring-2 focus:ring-teal-500";
const label = "text-sm font-medium text-gray-700";

export function BatchForm({ courses, instructors, initial, onDone }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BatchFormValues, unknown, BatchInput>({
    resolver: zodResolver(batchSchema),
    defaultValues: initial ?? {
      courseId: courses[0]?.id ?? "",
      instructorId: "",
      name: "",
      code: "",
      startDate: "",
      endDate: "",
      schedule: "",
      mode: "Physical",
      capacity: 0,
      status: "UPCOMING",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    const result = initial ? await updateBatch(initial.id, values) : await createBatch(values);
    if ("error" in result) return setServerError(result.error);
    onDone?.();
    router.refresh();
  });

  const err = (name: keyof BatchFormValues) =>
    errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]?.message}</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Course</label>
          <select {...register("courseId")} className={input}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {err("courseId")}
        </div>
        <div>
          <label className={label}>Instructor</label>
          <select {...register("instructorId")} className={input}>
            <option value="">— unassigned —</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name ?? i.email}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Only users with the INSTRUCTOR role appear here.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Batch name</label>
          <input {...register("name")} placeholder="Morning Batch 2026" className={input} />
          {err("name")}
        </div>
        <div>
          <label className={label}>Code</label>
          <input {...register("code")} placeholder="FSD-2026-A" className={input} />
          {err("code")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Start date</label>
          <input type="date" {...register("startDate")} className={input} />
        </div>
        <div>
          <label className={label}>End date</label>
          <input type="date" {...register("endDate")} className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Schedule</label>
        <input {...register("schedule")} placeholder="Sun–Thu, 7–9 AM" className={input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label}>Mode</label>
          <select {...register("mode")} className={input}>
            <option>Physical</option>
            <option>Online</option>
            <option>Hybrid</option>
          </select>
        </div>
        <div>
          <label className={label}>Capacity</label>
          <input type="number" min={0} {...register("capacity")} className={input} />
          <p className="mt-1 text-xs text-gray-500">0 = unlimited</p>
        </div>
        <div>
          <label className={label}>Status</label>
          <select {...register("status")} className={input}>
            <option value="UPCOMING">Upcoming</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : initial ? "Save changes" : "Create batch"}
      </button>
    </form>
  );
}
