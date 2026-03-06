import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FilterRule } from '../types';

const API = import.meta.env.VITE_API_BASE_URL;

function getHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export function useRules() {
  return useQuery<FilterRule[]>({
    queryKey: ['rules'],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/rules`, { headers: getHeaders() });
      return data;
    },
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: Omit<FilterRule, 'id' | 'userId' | 'isActive' | 'createdAt'>) => {
      const { data } = await axios.post(`${API}/api/rules`, rule, { headers: getHeaders() });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FilterRule> & { id: string }) => {
      const { data } = await axios.put(`${API}/api/rules/${id}`, updates, { headers: getHeaders() });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`${API}/api/rules/${id}`, { headers: getHeaders() });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}
