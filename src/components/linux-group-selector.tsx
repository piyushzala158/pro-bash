"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getPracticeRoute,
  linuxPracticeGroups,
  PRACTICE_PROGRESS_KEY,
  type PracticeProgress,
} from "@/lib/practice-data";
import { cn } from "@/lib/utils";

export function LinuxGroupSelector() {
  const [progress, setProgress] = useState<PracticeProgress>({ completedByGroup: {} });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PRACTICE_PROGRESS_KEY);

      if (stored) {
        setProgress(JSON.parse(stored) as PracticeProgress);
      }
    } catch {
      window.localStorage.removeItem(PRACTICE_PROGRESS_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_26%),linear-gradient(180deg,_#0a0d12_0%,_#10141d_45%,_#0b0e14_100%)] text-stone-50">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-25" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/10 bg-black/25 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.28)] backdrop-blur md:p-8">
          <div className="max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-sky-100">
              <Terminal className="size-3.5" />
              Linux Practice Simulator
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Pick a Linux skill group and train inside a focused terminal lab.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
                Each path opens its own no-distraction practice page with a real
                terminal-style simulator, saved progress, free command input, and a
                reset option when you want to start fresh.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Tracks</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {linuxPracticeGroups.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Lessons</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {linuxPracticeGroups.reduce((sum, group) => sum + group.exercises.length, 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Status</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">
                {hydrated ? "Progress loaded" : "Loading..."}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {linuxPracticeGroups.map((group) => {
            const completedIds = progress.completedByGroup[group.id] ?? [];
            const progressPercent = Math.round(
              (completedIds.length / group.exercises.length) * 100,
            );

            return (
              <Link
                key={group.id}
                href={getPracticeRoute(group.slug)}
                className={cn(
                  "group rounded-[1.75rem] border border-white/10 bg-black/30 p-5 transition",
                  "hover:border-white/20 hover:bg-black/40 hover:shadow-[0_24px_90px_rgba(0,0,0,0.24)]",
                )}
              >
                <div
                  className={cn(
                    "h-1.5 rounded-full bg-gradient-to-r",
                    group.accent,
                  )}
                />
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Linux Group
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {group.label}
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 p-2 text-stone-300 transition group-hover:text-white">
                    <ChevronRight className="size-4" />
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-stone-300">
                  {group.summary}
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-400">Completed</span>
                    <span className="font-semibold text-emerald-300">
                      {completedIds.length}/{group.exercises.length}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r", group.accent)}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-stone-300">
                  <span>{group.description}</span>
                  <span className="inline-flex items-center gap-2 font-medium text-white">
                    Open Lab
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
