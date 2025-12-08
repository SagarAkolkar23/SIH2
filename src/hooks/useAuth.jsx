// src/hooks/useAuth.js
// NOTE: This file is currently not used in the codebase
// The actual auth service is in src/service/authService.jsx
// Keeping this file for potential future use, but fixing the broken import

// import { useMutation, useQuery } from "@tanstack/react-query";
// import { useLoginApi } from "../service/authService"; // Fixed import path
// import { useAuthStore } from "../store/authStore";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export const useLogin = () => {
//   const setAuthData = useAuthStore((state) => state.setAuthData);
//   const loginMutation = useLoginApi();

//   return {
//     ...loginMutation,
//     // Wrapper to match expected API
//   };
// };

// export const useUserProfile = () =>
//   useQuery({
//     queryKey: ["user-profile"],
//     queryFn: async () => {
//       // Implement profile fetching if needed
//       throw new Error("Not implemented");
//     },
//     staleTime: 1000 * 60 * 5, // cache 5 mins
//   });
