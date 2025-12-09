import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/useQuery";

/**
 * Registration Service for Controllers
 * 
 * This service provides hooks for controllers to:
 * 1. Create houses (POST /api/houses)
 *    - Controllers can only create houses in their assigned grid
 *    - Backend automatically uses controller's gridId
 * 
 * 2. Create consumer users (POST /api/users/consumer)
 *    - Controllers can only create consumers for houses in their grid
 *    - Requires: name, email, password, phone, address, houseId
 * 
 * 3. Combined registration (house + user)
 *    - Creates house first, then creates consumer linked to that house
 *    - Used for registering new consumers with new houses
 * 
 * All endpoints require authentication and proper authorization.
 * Error handling extracts messages from backend responses.
 */

// Query Keys
const REGISTRATION_KEYS = {
  houses: ["registration", "houses"],
};

// GET /api/houses - Get all houses (controller sees only their grid's houses)
export const useHousesQuery = () => {
  return useQuery({
    queryKey: REGISTRATION_KEYS.houses,
    queryFn: async () => {
      const response = await api.get("/api/houses");
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
      try {
        const response = await api.post("/api/houses", data);
        return response.data;
      } catch (error) {
        // Extract error message from response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.message || 
                           'Failed to register house';
        throw new Error(errorMessage);
      }
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
      try {
        const response = await api.post("/api/users/consumer", data);
        return response.data;
      } catch (error) {
        // Extract error message from response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.message || 
                           'Failed to register user';
        throw new Error(errorMessage);
      }
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
      try {
        // Step 1: Create house
        const houseData = {
          address: data.houseAddress,
          locationCoordinates: {
            lat: parseFloat(data.latitude),
            long: parseFloat(data.longitude)
          }
        };
        
        const houseResponse = await api.post("/api/houses", houseData);
        
        if (!houseResponse.data?.success || !houseResponse.data?.data?.house?._id) {
          throw new Error('House creation failed: Invalid response from server');
        }
        
        const houseId = houseResponse.data.data.house._id;
        
        // Step 2: Create consumer with houseId
        const consumerData = {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          address: data.userAddress,
          houseId: houseId
        };
        
        const consumerResponse = await api.post("/api/users/consumer", consumerData);
        
        if (!consumerResponse.data?.success) {
          throw new Error(consumerResponse.data?.message || 'Consumer creation failed');
        }
        
        return {
          house: houseResponse.data.data.house,
          consumer: consumerResponse.data.data.consumer
        };
      } catch (error) {
        // Extract error message from response
        const errorMessage = error?.response?.data?.message || 
                           error?.response?.data?.error || 
                           error?.message || 
                           'Failed to register house and user';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      // Invalidate houses query to refetch
      queryClient.invalidateQueries({ queryKey: REGISTRATION_KEYS.houses });
    },
  });
};
