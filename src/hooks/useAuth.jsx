// src/hooks/useAuth.js
import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "../service/auth";
import { useAuthStore } from "../store/authStore";

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: ({ email, password }) => authService.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setAuth(data.user, data.token);
    },
  });
};

export const useUserProfile = () =>
  useQuery({
    queryKey: ["user-profile"],
    queryFn: authService.getProfile,
    staleTime: 1000 * 60 * 5, // cache 5 mins
  });
