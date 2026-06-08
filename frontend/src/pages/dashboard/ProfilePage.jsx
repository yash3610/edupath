import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

export default function ProfilePage() {
  const { student } = useOutletContext();
  const [profile, setProfile] = useState(student);

  function update(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Profile" title="Student profile" />

      <MotionCard>
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="text-center">
            <img src={profile.avatar} alt={profile.name} className="mx-auto h-36 w-36 rounded-3xl object-cover" />
            <h3 className="mt-4 text-xl font-black">{profile.name}</h3>
            <p className="break-all text-sm text-slate-500 dark:text-slate-300">{profile.email}</p>
          </div>

          <form className="grid gap-4 md:grid-cols-2">
            {["name", "email", "phone"].map((field) => (
              <label key={field} className="text-sm font-black capitalize">
                {field}
                <input
                  name={field}
                  value={profile[field]}
                  onChange={update}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-slate-800"
                />
              </label>
            ))}

            <label className="text-sm font-black md:col-span-2">
              Bio
              <textarea
                name="bio"
                value={profile.bio}
                onChange={update}
                className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-slate-800"
              />
            </label>

            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-black">Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-[#ff6b35] dark:bg-white/10">{skill}</span>
                ))}
              </div>
            </div>

            <button type="button" className="w-fit rounded-xl bg-[#ff6b35] px-5 py-3 text-sm font-black text-white">
              Save Profile
            </button>
          </form>
        </div>
      </MotionCard>
    </div>
  );
}
