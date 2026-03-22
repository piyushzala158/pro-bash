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
  const [progress, setProgress] = useState<PracticeProgress>({
    completedByGroup: {},
  });
  const [hydrated, setHydrated] = useState(false);
  const totalLessons = linuxPracticeGroups.reduce(
    (sum, group) => sum + group.exercises.length,
    0,
  );
  const faqItems = [
    {
      question: "Who is Pro Bash for?",
      answer:
        "It is designed for beginners learning Linux basics, developers refreshing command line skills, and interview candidates who want short hands-on Bash drills.",
    },
    {
      question: "Do I need to install Linux or open a real shell?",
      answer:
        "No. Each lesson runs inside a browser-based terminal environment so you can practice safely without changing your local machine.",
    },
    {
      question: "What can I practice here?",
      answer:
        "You can train Linux navigation, file management, search, permissions, and process inspection through guided command prompts.",
    },
  ];

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
                Practice Linux and Bash commands inside a focused browser terminal
                lab.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
                Train core Linux command line skills with guided exercises for
                navigation, file management, search, permissions, and process
                inspection. Each path opens its own no-distraction practice page
                with a real terminal-style simulator, saved progress, and a quick
                reset when you want another run.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                Tracks
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {linuxPracticeGroups.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                Lessons
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {totalLessons}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                Status
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">
                {hydrated ? "Progress loaded" : "Loading..."}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="practice-groups-heading" className="mt-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                Practice Categories
              </p>
              <h2
                id="practice-groups-heading"
                className="mt-2 text-2xl font-semibold text-white"
              >
                Linux practice paths built around real command line tasks
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-300">
              Start with one topic or move through every track to build a rounded
              Bash practice routine.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
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
                  <article>
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
                        <h3 className="mt-2 text-2xl font-semibold text-white">
                          {group.label}
                        </h3>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 p-2 text-stone-300 transition group-hover:text-white">
                        <ChevronRight className="size-4" />
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-stone-300">
                      {group.summary}
                    </p>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                        What you learn
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-300">
                        {group.learningFocus}
                      </p>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-400">Completed</span>
                        <span className="font-semibold text-emerald-300">
                          {completedIds.length}/{group.exercises.length}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r",
                            group.accent,
                          )}
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
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[1.75rem] border border-white/10 bg-black/25 p-6 backdrop-blur md:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
              Why this helps
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              A browser-based Linux terminal simulator makes command practice easier
              to repeat
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
              Fast repetition is one of the best ways to learn Bash. Pro Bash keeps
              each exercise short, focused, and safe, so you can practice Linux
              commands without setting up a virtual machine or worrying about
              breaking a real environment.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-lg font-semibold text-white">
                  Built for repetition
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  Repeat core commands until they feel natural, then reset the lab
                  and run the workflow again.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-lg font-semibold text-white">
                  Focused by topic
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  Practice one command family at a time so navigation, file work,
                  and debugging habits stick faster.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-black/25 p-6 backdrop-blur md:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">
              Who it is for
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Linux command practice for beginners, developers, and interview prep
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-stone-300">
              <li>
                Beginners who want a simple way to learn Bash commands without
                installing a full Linux setup first.
              </li>
              <li>
                Developers who need to refresh command line basics used in daily
                coding, debugging, and deployment work.
              </li>
              <li>
                Learners preparing for internships, technical interviews, or DevOps
                tasks that expect practical Linux familiarity.
              </li>
            </ul>
          </article>
        </section>

        <section className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/25 p-6 backdrop-blur md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
            Quick FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Questions people ask before starting Linux terminal practice
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <h3 className="text-lg font-semibold text-white">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
