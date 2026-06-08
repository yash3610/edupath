import React from "react";
import { assignments } from "../../data/dashboardData.js";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Assignments" title="Upload submissions and track feedback" />

      <MotionCard className="border-dashed text-center">
        <Icon name="UploadCloud" className="mx-auto h-14 w-14 text-[#ff6b35]" />
        <h3 className="mt-4 text-2xl font-black">Upload PDF, ZIP, or images</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-300">
          Drag files here or choose a file. Demo UI stores the upload state visually.
        </p>
        <input type="file" multiple accept=".pdf,.zip,image/*" className="mt-6 rounded-2xl bg-white p-4 shadow dark:bg-white/10" />
      </MotionCard>

      <div className="grid gap-4">
        {assignments.map(([title, status, deadline, grade, feedback]) => (
          <MotionCard key={title}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="text-slate-500 dark:text-slate-300">Deadline: {deadline} - Grade: {grade}</p>
                <p className="mt-2 text-sm">{feedback}</p>
              </div>
              <span className="w-fit rounded-full bg-[#ff6b35]/10 px-4 py-2 text-sm font-black text-[#ff6b35]">
                {status}
              </span>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  );
}
