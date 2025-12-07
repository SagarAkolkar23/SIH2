import { useCustomQuery } from "../../api/useQuery.js";

export const useSolarReadings = (enableLive = true) => {
  return useCustomQuery({
    queryKey: ["solar-readings"],
    queryFn: () => ({
      method: "GET",
      url: "/api/solar",
    }),
    refetchInterval: enableLive ? 2000 : false, // auto refresh every 2s
    staleTime: 1000,
  });
};
