import { describe, expect, it } from "@jest/globals";
import {
  extractGitHubUsername,
  getGitHubContributionYears,
  mapGitHubContributionResponse,
  type GitHubGraphqlPayload,
} from "./github-contributions";

const GITHUB_GRAPHQL_FIXTURE: GitHubGraphqlPayload = {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          months: [
            { name: "Jan", totalWeeks: 2, year: 2026 },
            { name: "Feb", totalWeeks: 2, year: 2026 },
          ],
          totalContributions: 19,
          weeks: [
            {
              contributionDays: [
                {
                  color: "#173b2b",
                  contributionCount: 1,
                  contributionLevel: "FIRST_QUARTILE",
                  date: "2026-01-11",
                },
                {
                  color: "#1f6a47",
                  contributionCount: 3,
                  contributionLevel: "SECOND_QUARTILE",
                  date: "2026-01-12",
                },
              ],
            },
            {
              contributionDays: [
                {
                  color: "#56d364",
                  contributionCount: 9,
                  contributionLevel: "FOURTH_QUARTILE",
                  date: "2026-02-08",
                },
                {
                  color: "#0f1724",
                  contributionCount: 0,
                  contributionLevel: "NONE",
                  date: "2026-02-09",
                },
              ],
            },
          ],
        },
        commitContributionsByRepository: [
          {
            contributions: { totalCount: 10 },
            repository: {
              nameWithOwner: "tqdat410/da-portfolio-v4.0",
              url: "https://github.com/tqdat410/da-portfolio-v4.0",
            },
          },
        ],
        issueContributionsByRepository: [
          {
            contributions: { totalCount: 2 },
            repository: {
              nameWithOwner: "tqdat410/da-portfolio-v4.0",
              url: "https://github.com/tqdat410/da-portfolio-v4.0",
            },
          },
        ],
        pullRequestContributionsByRepository: [
          {
            contributions: { totalCount: 5 },
            repository: {
              nameWithOwner: "tqdat410/balance-of-interests",
              url: "https://github.com/tqdat410/balance-of-interests",
            },
          },
        ],
        pullRequestReviewContributionsByRepository: [
          {
            contributions: { totalCount: 2 },
            repository: {
              nameWithOwner: "tqdat410/socialist-democracy",
              url: "https://github.com/tqdat410/socialist-democracy",
            },
          },
        ],
      },
    },
  },
};

describe("github-contributions", () => {
  it("extracts the GitHub username from a profile URL", () => {
    expect(extractGitHubUsername("https://github.com/tqdat410/")).toBe("tqdat410");
  });

  it("returns null for invalid GitHub profile URLs", () => {
    expect(extractGitHubUsername("https://example.com/tqdat410")).toBeNull();
  });

  it("builds year filters from 2025 onward", () => {
    expect(getGitHubContributionYears(2025, new Date("2026-03-14T00:00:00.000Z"))).toEqual([
      2026, 2025,
    ]);
  });

  it("maps the GitHub GraphQL contribution payload", () => {
    const snapshot = mapGitHubContributionResponse(GITHUB_GRAPHQL_FIXTURE, {
      from: new Date("2025-03-15T00:00:00.000Z"),
      to: new Date("2026-03-14T00:00:00.000Z"),
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot?.totalContributions).toBe(19);
    expect(snapshot?.activeDays).toBe(3);
    expect(snapshot?.longestStreak).toBe(3);
    expect(snapshot?.currentStreak).toBe(0);
    expect(snapshot?.peakDay).toEqual({ contributionCount: 9, dateLabel: "Feb 8" });
    expect(snapshot?.monthLabels).toEqual([
      { label: "Jan", weekIndex: 0 },
      { label: "Feb", weekIndex: 2 },
    ]);
    expect(snapshot?.repositories[0]).toEqual({
      contributionCount: 12,
      name: "tqdat410/da-portfolio-v4.0",
      url: "https://github.com/tqdat410/da-portfolio-v4.0",
    });
    expect(snapshot?.mix).toEqual([
      { color: "#3fb950", contributionCount: 10, label: "Commits", percentage: 53 },
      { color: "#2f81f7", contributionCount: 5, label: "Pull requests", percentage: 26 },
      { color: "#d29922", contributionCount: 2, label: "Issues", percentage: 11 },
      { color: "#db61a2", contributionCount: 2, label: "Code review", percentage: 11 },
    ]);
  });

  it("returns null for invalid GraphQL payloads", () => {
    expect(
      mapGitHubContributionResponse(
        { errors: [{ message: "Unauthorized" }] },
        { from: new Date("2025-03-15T00:00:00.000Z"), to: new Date("2026-03-14T00:00:00.000Z") }
      )
    ).toBeNull();
  });
});
