import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/useQuery";

// Query Keys
const REGISTRATION_KEYS = {
  microgrids: ["registration", "microgrids"],
  houses: (microgridId) => ["registration", "houses", microgridId || "all"],
};

// GET /api/controller/microgrids
export const useMicrogridsQuery = () => {
  return useQuery({
    queryKey: REGISTRATION_KEYS.microgrids,
    queryFn: async () => {
      console.log('🔍 [REGISTRATION] Fetching microgrids...');
      const response = await api.get("/api/controller/microgrids");
      console.log('✅ [REGISTRATION] Microgrids fetched:', response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// GET /api/controller/houses
export const useHousesQuery = (microgridId = null) => {
  return useQuery({
    queryKey: REGISTRATION_KEYS.houses(microgridId),
    queryFn: async () => {
      console.log('🔍 [REGISTRATION] Fetching houses...', microgridId ? `for microgrid: ${microgridId}` : 'all');
      const params = microgridId ? { microgridId } : {};
      const response = await api.get("/api/controller/houses", { params });
      console.log('✅ [REGISTRATION] Houses fetched:', response.data);
      return response.data;
    },
    enabled: true, // Always enabled
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// POST /api/controller/register/house
export const useRegisterHouseApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      console.log('📤 [REGISTRATION] Registering house:', data);
      const response = await api.post("/api/controller/register/house", data);
      console.log('✅ [REGISTRATION] House registered:', response.data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate houses query to refetch
      queryClient.invalidateQueries({ queryKey: ["registration", "houses"] });
    },
  });
};

// POST /api/controller/register/user
export const useRegisterUserApi = () => {
  return useMutation({
    mutationFn: async (data) => {
      console.log('📤 [REGISTRATION] Registering user:', { ...data, password: '***' });
      const response = await api.post("/api/controller/register/user", data);
      console.log('✅ [REGISTRATION] User registered:', response.data);
      return response.data;
    },
  });
};

// POST /api/controller/register/house-and-user
export const useRegisterHouseAndUserApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      console.log('📤 [REGISTRATION] Registering house and user:', { ...data, password: '***' });
      const response = await api.post("/api/controller/register/house-and-user", data);
      console.log('✅ [REGISTRATION] House and user registered:', response.data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate houses query to refetch
      queryClient.invalidateQueries({ queryKey: ["registration", "houses"] });
    },
  });
};
