import type { GitHubContributionSnapshot } from "@/lib/github-contributions";

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""] as const;
const LEVEL_COLORS = {
  FOURTH_QUARTILE: "#24292f",
  NONE: "#ebedf0",
  SECOND_QUARTILE: "#8b949e",
  THIRD_QUARTILE: "#57606a",
  FIRST_QUARTILE: "#c9d1d9",
} as const;

const LEGEND_COLORS = [
  LEVEL_COLORS.NONE,
  LEVEL_COLORS.FIRST_QUARTILE,
  LEVEL_COLORS.SECOND_QUARTILE,
  LEVEL_COLORS.THIRD_QUARTILE,
  LEVEL_COLORS.FOURTH_QUARTILE,
] as const;

interface AboutGitHubContributionCalendarGridProps {
  snapshot: GitHubContributionSnapshot;
  year: number;
}

export function AboutGitHubContributionCalendarGrid({
  snapshot,
  year,
}: AboutGitHubContributionCalendarGridProps) {
  return (
    <div className="min-w-0 bg-transparent px-1 py-1">
      <p className="text-[15px] font-medium text-[#24292f]">
        {snapshot.totalContributions.toLocaleString("en-US")} contributions in {year}
      </p>

      <div className="mt-4 w-full max-w-full overflow-hidden rounded-md border border-[#d0d7de] bg-[var(--brand-fg)] px-4 py-4 [--contribution-cell-size:8px] md:w-fit md:[--contribution-cell-size:10px]">
        <div className="w-full touch-pan-x overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <div className="w-max min-w-full pb-1">
            <div
              className="grid w-max gap-[3px]"
              style={{
                gridTemplateColumns: `24px repeat(${snapshot.weeks.length}, var(--contribution-cell-size))`,
                gridTemplateRows: "18px repeat(7, var(--contribution-cell-size))",
              }}
            >
              {snapshot.monthLabels.map(({ label, weekIndex }) => (
                <span
                  key={`${label}-${weekIndex}`}
                  className="text-[10px] leading-none text-[#57606a]"
                  style={{ gridColumnStart: weekIndex + 2, gridRowStart: 1 }}
                >
                  {label}
                </span>
              ))}

              {WEEKDAY_LABELS.map((label, dayIndex) =>
                label ? (
                  <span
                    key={label}
                    className="text-[10px] leading-none text-[#57606a]"
                    style={{ gridColumnStart: 1, gridRowStart: dayIndex + 2 }}
                  >
                    {label}
                  </span>
                ) : null
              )}

              {snapshot.weeks.map((week, weekIndex) =>
                week.map((day, dayIndex) => (
                  <span
                    key={day.date}
                    className="h-[var(--contribution-cell-size)] w-[var(--contribution-cell-size)] rounded-[2px]"
                    style={{
                      backgroundColor: LEVEL_COLORS[
                        day.contributionLevel as keyof typeof LEVEL_COLORS
                      ] ?? LEVEL_COLORS.NONE,
                      gridColumnStart: weekIndex + 2,
                      gridRowStart: dayIndex + 2,
                    }}
                    title={day.summary}
                    aria-label={day.summary}
                  />
                ))
              )}
            </div>

            <div className="mt-4 flex justify-end text-[12px] text-[#57606a]">
              <div className="flex items-center gap-2">
                <span>Less</span>
                {LEGEND_COLORS.map((color, index) => (
                  <span
                    key={`${color}-${index}`}
                    className="h-[var(--contribution-cell-size)] w-[var(--contribution-cell-size)] rounded-[2px]"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
