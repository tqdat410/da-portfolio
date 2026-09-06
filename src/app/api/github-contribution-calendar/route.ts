import { NextResponse } from "next/server";
import { content } from "@/content";
import {
  extractGitHubUsername,
  getGitHubContributionCalendarSnapshot,
  getGitHubContributionYears,
} from "@/lib/github-contributions";

type CalendarApiStatus = "ok" | "missing-token" | "invalid-profile" | "api-error";

export async function GET(request: Request) {
  const availableYears = getGitHubContributionYears();
  const requestedYear = Number(new URL(request.url).searchParams.get("year"));
  const selectedYear = availableYears.includes(requestedYear) ? requestedYear : availableYears[0];
  const profileUrl = content.social.github;
  const username = extractGitHubUsername(profileUrl);
  const token = process.env.GITHUB_GRAPHQL_TOKEN ?? process.env.GITHUB_TOKEN;

  const buildResponse = (
    status: CalendarApiStatus,
    snapshot: Awaited<ReturnType<typeof getGitHubContributionCalendarSnapshot>> = null
  ) =>
    NextResponse.json({
      availableYears,
      profileUrl,
      selectedYear,
      snapshot,
      status,
    });

  if (!selectedYear) {
    return buildResponse("api-error");
  }

  if (!username) {
    return buildResponse("invalid-profile");
  }

  if (!token) {
    return buildResponse("missing-token");
  }

  const snapshot = await getGitHubContributionCalendarSnapshot(username, selectedYear);
  return buildResponse(snapshot ? "ok" : "api-error", snapshot);
}
