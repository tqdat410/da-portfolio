"use client";

import { useEffect, useState, useTransition } from "react";
import type { GitHubContributionSnapshot } from "@/lib/github-contributions";
import { AboutGitHubContributionCalendarGrid } from "./AboutGitHubContributionCalendarGrid";

type CalendarApiStatus = "ok" | "missing-token" | "invalid-profile" | "api-error";

interface CalendarApiResponse {
  availableYears: number[];
  selectedYear: number;
  snapshot: GitHubContributionSnapshot | null;
  status: CalendarApiStatus;
}

function getInitialYears(today = new Date()): number[] {
  const currentYear = today.getUTCFullYear();
  const years: number[] = [];

  for (let year = currentYear; year >= 2025; year -= 1) {
    years.push(year);
  }

  return years;
}

function getStatusCopy(status: CalendarApiStatus) {
  switch (status) {
    case "missing-token":
      return "Add GITHUB_GRAPHQL_TOKEN to enable the live contribution calendar.";
    case "invalid-profile":
      return "The GitHub profile URL is invalid, so the calendar could not be loaded.";
    default:
      return "GitHub could not return the contribution calendar right now.";
  }
}

export function AboutGitHubContributionCalendar() {
  const [isPending, startTransition] = useTransition();
  const [availableYears, setAvailableYears] = useState(() => getInitialYears());
  const [selectedYear, setSelectedYear] = useState(() => getInitialYears()[0] ?? 2025);
  const [snapshot, setSnapshot] = useState<GitHubContributionSnapshot | null>(null);
  const [status, setStatus] = useState<CalendarApiStatus>("ok");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCalendar() {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/github-contribution-calendar?year=${selectedYear}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as CalendarApiResponse;

        setAvailableYears(data.availableYears);
        setSnapshot(data.snapshot);
        setStatus(data.status);

        if (data.selectedYear !== selectedYear) {
          setSelectedYear(data.selectedYear);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSnapshot(null);
        setStatus("api-error");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCalendar();
    return () => controller.abort();
  }, [selectedYear]);

  return (
    <div className="mt-12 mb-24 md:mt-16">
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_88px]">
        <div className="min-w-0">
          {snapshot && !isLoading ? (
            <AboutGitHubContributionCalendarGrid snapshot={snapshot} year={selectedYear} />
          ) : (
            <div className="bg-transparent px-1 py-1">
              <div className="h-5 w-44 animate-pulse rounded bg-[#eaeef2]" />
              <div className="mt-4 h-[176px] rounded bg-[linear-gradient(180deg,#f6f8fa_0%,#eef2f6_100%)]" />
              <p className="mt-4 text-sm text-[#57606a]">
                {isLoading ? "Loading contribution calendar..." : getStatusCopy(status)}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
          {availableYears.map((year) => {
            const isActive = year === selectedYear;

            return (
              <button
                key={year}
                type="button"
                onClick={() => startTransition(() => setSelectedYear(year))}
                className={`min-w-[84px] rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--brand-bg)] text-[var(--brand-fg)]"
                    : "bg-transparent text-[#57606a] hover:text-[var(--brand-bg)]"
                }`}
                aria-pressed={isActive}
                disabled={isPending && isActive}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
