import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/utils/api';
import { Interaction, PaginatedInteractions, UserStats } from '@/types/interaction';
import { useUser } from '@clerk/nextjs';

export const useUserData = () => {
  const { user } = useUser();
  
  return useQuery<{ username: string; email: string }>({
    queryKey: ['userData'],
    queryFn: () => fetchWithAuth('/users/me', user?.id || ''),
    enabled: !!user,
  });
};

export const useUserInteractions = (
  page = 1,
  perPage = 10,
  sortBy = 'created_at',
  order = 'desc'
) => {
  const { user } = useUser();

  return useQuery<PaginatedInteractions>({
    queryKey: ['userInteractions', page, perPage, sortBy, order],
    queryFn: () => fetchWithAuth(
      `/users/me/interactions?page=${page}&per_page=${perPage}&sort_by=${sortBy}&order=${order}`,
      user?.id || ''
    ),
    enabled: !!user,
  });
};

export const useUserStats = () => {
  const { user } = useUser();

  return useQuery<UserStats>({
    queryKey: ['userStats'],
    queryFn: () => fetchWithAuth('/users/me/stats', user?.id || ''),
    enabled: !!user,
  });
}; 