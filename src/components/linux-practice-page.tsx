"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  CircleOff,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getLinuxPracticeGroupBySlug,
  PRACTICE_PROGRESS_KEY,
  PRACTICE_SHOW_COMMANDS_KEY,
  type LinuxPracticeGroup,
  type PracticeExercise,
  type PracticeProgress,
} from "@/lib/practice-data";
import {
  type TerminalRuntimeSession,
  webcontainerRuntimeAdapter,
} from "@/lib/webcontainer-runtime";
import { cn } from "@/lib/utils";

type LinuxPracticePageProps = {
  groupSlug: string;
};

function normalizeCommand(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function getCompletedIds(progress: PracticeProgress, groupId: string) {
  return progress.completedByGroup[groupId] ?? [];
}

function getFirstIncompleteExercise(
  group: LinuxPracticeGroup,
  completedIds: string[],
) {
  return (
    group.exercises.find((exercise) => !completedIds.includes(exercise.id)) ??
    group.exercises[group.exercises.length - 1]
  );
}

function getExerciseById(group: LinuxPracticeGroup, exerciseId: string) {
  return (
    group.exercises.find((exercise) => exercise.id === exerciseId) ??
    group.exercises[0]
  );
}

export function LinuxPracticePage({ groupSlug }: LinuxPracticePageProps) {
  const group = getLinuxPracticeGroupBySlug(groupSlug);
  const [progress, setProgress] = useState<PracticeProgress>({
    completedByGroup: {},
  });
  const [activeExerciseId, setActiveExerciseId] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [runtimeState, setRuntimeState] = useState<
    "booting" | "ready" | "error"
  >("booting");
  const [runtimeError, setRuntimeError] = useState("");
  const terminalHostRef = useRef<HTMLDivElement>(null);
  const runtimeSessionRef = useRef<TerminalRuntimeSession | null>(null);
  const progressRef = useRef(progress);
  const activeExerciseIdRef = useRef(activeExerciseId);

  useEffect(() => {
    if (!group) {
      return;
    }

    try {
      const storedProgress = window.localStorage.getItem(PRACTICE_PROGRESS_KEY);
      const storedShowCommands = window.localStorage.getItem(
        PRACTICE_SHOW_COMMANDS_KEY,
      );

      const parsedProgress = storedProgress
        ? (JSON.parse(storedProgress) as PracticeProgress)
        : { completedByGroup: {} };
      const completedIds = getCompletedIds(parsedProgress, group.id);
      const firstExercise = getFirstIncompleteExercise(group, completedIds);

      setProgress(parsedProgress);
      setShowCommands(storedShowCommands === "true");
      setActiveExerciseId(firstExercise?.id ?? group.exercises[0]?.id ?? "");
    } catch {
      window.localStorage.removeItem(PRACTICE_PROGRESS_KEY);
      window.localStorage.removeItem(PRACTICE_SHOW_COMMANDS_KEY);
      setProgress({ completedByGroup: {} });
      setActiveExerciseId(group.exercises[0]?.id ?? "");
      setShowCommands(false);
    } finally {
      setHydrated(true);
    }
  }, [group]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      PRACTICE_PROGRESS_KEY,
      JSON.stringify(progress),
    );
  }, [hydrated, progress]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(
      PRACTICE_SHOW_COMMANDS_KEY,
      String(showCommands),
    );
  }, [hydrated, showCommands]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    activeExerciseIdRef.current = activeExerciseId;
  }, [activeExerciseId]);

  useEffect(() => {
    if (!group || !hydrated || !terminalHostRef.current) {
      return;
    }

    let disposed = false;
    setRuntimeState("booting");
    setRuntimeError("");

    const host = terminalHostRef.current;
    host.innerHTML = "";

    void webcontainerRuntimeAdapter
      .startSession(group, host, (submittedCommand) => {
        const normalizedInput = normalizeCommand(submittedCommand);
        const activeLesson = getExerciseById(
          group,
          activeExerciseIdRef.current,
        );
        const currentCompletedIds = getCompletedIds(
          progressRef.current,
          group.id,
        );
        const didMatch = activeLesson.acceptedCommands
          .map(normalizeCommand)
          .includes(normalizedInput);

        if (!didMatch || currentCompletedIds.includes(activeLesson.id)) {
          return;
        }

        setProgress((currentProgress) => {
          const completedIdsForGroup = getCompletedIds(
            currentProgress,
            group.id,
          );

          if (completedIdsForGroup.includes(activeLesson.id)) {
            return currentProgress;
          }

          return {
            completedByGroup: {
              ...currentProgress.completedByGroup,
              [group.id]: [...completedIdsForGroup, activeLesson.id],
            },
          };
        });

        const activeIndex = group.exercises.findIndex(
          (exercise) => exercise.id === activeLesson.id,
        );
        const nextExercise = group.exercises[activeIndex + 1];

        if (nextExercise) {
          setActiveExerciseId(nextExercise.id);
        }
      })
      .then((runtimeSession) => {
        if (disposed) {
          runtimeSession.dispose();
          return;
        }

        runtimeSessionRef.current = runtimeSession;
        setRuntimeState("ready");
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to boot the in-browser terminal runtime.";
        setRuntimeError(message);
        setRuntimeState("error");
      });

    return () => {
      disposed = true;
      runtimeSessionRef.current?.dispose();
      runtimeSessionRef.current = null;
    };
  }, [group, hydrated]);

  if (!group) {
    return null;
  }

  const currentGroup = group;
  const completedIds = getCompletedIds(progress, currentGroup.id);
  const activeExercise = getExerciseById(currentGroup, activeExerciseId);
  const progressPercent = Math.round(
    (completedIds.length / currentGroup.exercises.length) * 100,
  );
  const allExercisesCompleted =
    completedIds.length === currentGroup.exercises.length;

  function selectExercise(exercise: PracticeExercise, index: number) {
    const isLocked = index > completedIds.length;

    if (isLocked) {
      return;
    }

    setActiveExerciseId(exercise.id);
  }

  function persistCompletion(exercise: PracticeExercise) {
    setProgress((currentProgress) => {
      const currentCompletedIds = getCompletedIds(
        currentProgress,
        currentGroup.id,
      );

      if (currentCompletedIds.includes(exercise.id)) {
        return currentProgress;
      }

      return {
        completedByGroup: {
          ...currentProgress.completedByGroup,
          [currentGroup.id]: [...currentCompletedIds, exercise.id],
        },
      };
    });
  }

  async function handleReset() {
    setRuntimeState("booting");

    setProgress((currentProgress) => ({
      completedByGroup: {
        ...currentProgress.completedByGroup,
        [currentGroup.id]: [],
      },
    }));
    setActiveExerciseId(currentGroup.exercises[0]?.id ?? "");

    try {
      const currentSession = runtimeSessionRef.current;

      if (currentSession) {
        currentSession.dispose();
      }

      if (terminalHostRef.current) {
        terminalHostRef.current.innerHTML = "";
        runtimeSessionRef.current =
          await webcontainerRuntimeAdapter.startSession(
            currentGroup,
            terminalHostRef.current,
            (submittedCommand) => {
              const normalizedInput = normalizeCommand(submittedCommand);
              const activeLesson = getExerciseById(
                currentGroup,
                activeExerciseIdRef.current,
              );
              const currentCompletedIds = getCompletedIds(
                progressRef.current,
                currentGroup.id,
              );
              const didMatch = activeLesson.acceptedCommands
                .map(normalizeCommand)
                .includes(normalizedInput);

              if (!didMatch || currentCompletedIds.includes(activeLesson.id)) {
                return;
              }

              persistCompletion(activeLesson);

              const lessonIndex = currentGroup.exercises.findIndex(
                (exercise) => exercise.id === activeLesson.id,
              );
              const upcomingLesson = currentGroup.exercises[lessonIndex + 1];

              if (upcomingLesson) {
                setActiveExerciseId(upcomingLesson.id);
              }
            },
          );
      }

      setRuntimeState("ready");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to restart the in-browser terminal runtime.";
      setRuntimeError(message);
      setRuntimeState("error");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.12),_transparent_28%),linear-gradient(180deg,_#090b10_0%,_#0f141b_45%,_#090d12_100%)] text-stone-50 lg:h-screen">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-20" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:h-screen lg:overflow-hidden lg:px-8">
        <section className="mb-4 rounded-[1.75rem] border border-white/10 bg-black/30 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-stone-300 transition hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Back to Linux groups
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-stone-200",
                    `bg-gradient-to-r ${currentGroup.accent}`,
                  )}
                >
                  <Terminal className="size-3.5 text-black" />
                  <span className="text-black">{currentGroup.label}</span>
                </div>
                <span className="text-sm text-stone-400">
                  {completedIds.length}/{currentGroup.exercises.length} complete
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                {currentGroup.summary}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200">
                <span>Show command</span>
                <span
                  className={cn(
                    "flex h-5 w-9 items-center rounded-full border px-0.5 transition",
                    showCommands
                      ? "border-emerald-300/60 bg-emerald-300/20"
                      : "border-white/15 bg-white/5",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={showCommands}
                    onChange={(event) => setShowCommands(event.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "size-3.5 rounded-full transition",
                      showCommands
                        ? "translate-x-4 bg-emerald-300"
                        : "bg-stone-300",
                    )}
                  />
                </span>
              </label>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="border-white/15 bg-white/5 text-stone-100 hover:bg-white/10"
              >
                <RotateCcw className="size-4" />
                Reset practice
              </Button>
            </div>
          </div>
        </section>

        <section className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[1.75rem] border border-white/10 bg-black/30 p-4 backdrop-blur lg:min-h-0 lg:overflow-hidden">
            <div className="border-b border-white/10 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                Lesson Rail
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {currentGroup.label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                {currentGroup.description}
              </p>
            </div>

            <div className="mt-4 flex max-h-[40vh] flex-col gap-3 overflow-y-auto pr-1 lg:max-h-none lg:flex-1">
              {currentGroup.exercises.map((exercise, index) => {
                const isCompleted = completedIds.includes(exercise.id);
                const isCurrent = exercise.id === activeExercise.id;
                const isLocked = index > completedIds.length;

                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => selectExercise(exercise, index)}
                    disabled={isLocked}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
                      isCurrent
                        ? "border-emerald-300/50 bg-emerald-300/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                      isLocked &&
                        "cursor-not-allowed border-white/8 bg-white/[0.02] text-stone-500 hover:border-white/8 hover:bg-white/[0.02]",
                    )}
                  >
                    <span className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="size-5 text-emerald-300" />
                      ) : isCurrent ? (
                        <Circle className="size-5 text-amber-200" />
                      ) : (
                        <CircleOff className="size-5 text-stone-400" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white">
                        {index + 1}. {exercise.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-stone-300">
                        {exercise.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex flex-col rounded-[1.75rem] border border-white/10 bg-[#0a0f14]/80 p-4 backdrop-blur lg:min-h-0 lg:overflow-hidden md:p-5">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">
                    Current Task
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {activeExercise.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-200">
                    {activeExercise.prompt}
                  </p>
                  {showCommands ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                        Exact command
                      </p>
                      <p className="mt-2 font-mono text-sm text-emerald-200">
                        {activeExercise.acceptedCommands.join("  or  ")}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-300">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                    Goal
                  </p>
                  <p className="mt-2 max-w-sm">{activeExercise.goal}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex min-h-[520px] flex-col rounded-[1.5rem] border border-white/10 bg-black/55 shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:min-h-0 lg:flex-1">
              <div className="flex items-center gap-2 rounded-t-[1.5rem] border-b border-white/10 bg-white/5 px-4 py-3">
                <span className="size-3 rounded-full bg-red-400/80" />
                <span className="size-3 rounded-full bg-amber-300/80" />
                <span className="size-3 rounded-full bg-emerald-300/80" />
                <span className="ml-3 text-xs uppercase tracking-[0.3em] text-stone-400">
                  Browser shell
                </span>
                <span className="ml-auto text-xs uppercase tracking-[0.24em] text-stone-500">
                  {allExercisesCompleted
                    ? "Path complete"
                    : `${progressPercent}% complete`}
                </span>
              </div>

              <div className="relative flex-1 min-h-[260px]">
                <div className="h-full w-full  p-2 lg:p-3">
                  <div
                    ref={terminalHostRef}
                    className="terminal-shell-host h-full w-full"
                  />
                </div>
                {runtimeState !== "ready" ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#05080d]/97 px-6 text-center backdrop-blur-sm">
                    <div className="max-w-md rounded-2xl border border-white/15 bg-[#05080d]/92 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.5)]">
                      <p className="text-sm font-medium text-white">
                        {runtimeState === "booting"
                          ? "Booting the in-browser terminal runtime..."
                          : "Terminal runtime unavailable"}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-stone-300">
                        {runtimeState === "booting"
                          ? "This uses a real browser shell session, so the environment may take a moment to initialize."
                          : runtimeError}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-white/10 bg-[#06090d]/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Use the embedded terminal directly. Type any command and press
                  Enter.
                </p>
                <p className="mt-2 text-sm text-stone-300">
                  Lessons complete only when your entered command matches the
                  active task.
                </p>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
