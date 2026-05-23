import { useGetPlatformStats, useGetActivityFeed } from "@workspace/api-client-react";

export function useLivePlatformStats() {
  return useGetPlatformStats({
    query: {
      queryKey: ["platform-stats-live"],
      refetchInterval: 7000,
      refetchIntervalInBackground: false,
      staleTime: 5000,
    },
  });
}

export function useLiveActivityFeed() {
  return useGetActivityFeed({
    query: {
      queryKey: ["activity-feed-live"],
      refetchInterval: 8000,
      refetchIntervalInBackground: false,
      staleTime: 5000,
    },
  });
}
