import { useMemo } from "react";
import type { DangerAlert, DangerAlertComment, DangerAlertVote } from "@/types/danger-alerts";

export type DangerAlertWithStats = DangerAlert & {
  score: number;
  commentCount: number;
};

export function rankAlert(a: DangerAlertWithStats) {
  // Simple, explainable ranking: score dominates, then discussion.
  return a.score * 10 + a.commentCount;
}

export function useAlertStats(
  alerts: DangerAlert[],
  votes: DangerAlertVote[],
  comments: DangerAlertComment[],
): DangerAlertWithStats[] {
  return useMemo(() => {
    const voteScore = new Map<string, number>();
    for (const v of votes) voteScore.set(v.alert_id, (voteScore.get(v.alert_id) ?? 0) + v.vote);

    const commentCount = new Map<string, number>();
    for (const c of comments) commentCount.set(c.alert_id, (commentCount.get(c.alert_id) ?? 0) + 1);

    return alerts
      .map((a) => ({
        ...a,
        score: voteScore.get(a.id) ?? 0,
        commentCount: commentCount.get(a.id) ?? 0,
      }))
      .sort((x, y) => rankAlert(y) - rankAlert(x));
  }, [alerts, votes, comments]);
}
