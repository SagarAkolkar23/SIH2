import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/useQuery";

// Query Keys
const REGISTRATION_KEYS = {
  houses: ["registration", "houses"],
};

// GET /api/houses - Get all houses (controller sees only their grid's houses)
export const useHousesQuery = () => {
  return useQuery({
    queryKey: REGISTRATION_KEYS.houses,
    queryFn: async () => {
      console.log('🔍 [REGISTRATION] Fetching houses...');
      const response = await api.get("/api/houses");
      console.log('✅ [REGISTRATION] Houses fetched:', response.data);
      return response.data;
    },
    enabled: true, // Always enabled
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// POST /api/houses - Create house
export const useRegisterHouseApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      console.log('📤 [REGISTRATION] Registering house:', data);
      const response = await api.post("/api/houses", data);
      console.log('✅ [REGISTRATION] House registered:', response.data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate houses query to refetch
      queryClient.invalidateQueries({ queryKey: REGISTRATION_KEYS.houses });
    },
  });
};

// POST /api/users/consumer - Create consumer user
export const useRegisterUserApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      console.log('📤 [REGISTRATION] Registering user:', { ...data, password: '***' });
      const response = await api.post("/api/users/consumer", data);
      console.log('✅ [REGISTRATION] User registered:', response.data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate houses query to refetch (in case house owner was updated)
      queryClient.invalidateQueries({ queryKey: REGISTRATION_KEYS.houses });
    },
  });
};

// Combined: Create house then create consumer
export const useRegisterHouseAndUserApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      console.log('📤 [REGISTRATION] Registering house and user:', { ...data, password: '***' });
      
      try {
        // Step 1: Create house
        const houseData = {
          address: data.houseAddress,
          locationCoordinates: {
            lat: parseFloat(data.latitude),
            long: parseFloat(data.longitude)
          }
        };
        
        console.log('📤 [REGISTRATION] Step 1: Creating house...');
        const houseResponse = await api.post("/api/houses", houseData);
        console.log('✅ [REGISTRATION] House created:', houseResponse.data);
        
        if (!houseResponse.data?.success || !houseResponse.data?.data?.house?._id) {
          throw new Error('House creation failed: Invalid response from server');
        }
        
        const houseId = houseResponse.data.data.house._id;
        console.log('📋 [REGISTRATION] House ID:', houseId);
        
        // Step 2: Create consumer with houseId
        const consumerData = {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          address: data.userAddress,
          houseId: houseId
        };
        
        console.log('📤 [REGISTRATION] Step 2: Creating consumer...');
        const consumerResponse = await api.post("/api/users/consumer", consumerData);
        console.log('✅ [REGISTRATION] Consumer created:', consumerResponse.data);
        
        if (!consumerResponse.data?.success) {
          throw new Error(consumerResponse.data?.message || 'Consumer creation failed');
        }
        
        return {
          house: houseResponse.data.data.house,
          consumer: consumerResponse.data.data.consumer
        };
      } catch (error) {
        console.error('❌ [REGISTRATION] Error in registration flow:', error);
        // Re-throw to let the component handle it
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate houses query to refetch
      queryClient.invalidateQueries({ queryKey: REGISTRATION_KEYS.houses });
    },
  });
};
