import { useCustomQuery } from "../../api/useQuery.js";

export const useSolarReadings = (enableLive = true) => {
  return useCustomQuery({
    queryKey: ["solar-readings"],
    queryFn: () => ({
      method: "GET",
      url: "/api/solar",
    }),
    refetchInterval: enableLive ? 3000 : false, // auto refresh every 3s (reduced from 2s to prevent freezing)
    staleTime: 2000,
    refetchIntervalInBackground: false, // Don't poll in background
  });
};
