import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Email, EmailsResponse, EmailSummary } from '../types';

const API = import.meta.env.VITE_API_BASE_URL;

function getHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export function useEmails(page = 1, importance?: string) {
  return useQuery<EmailsResponse>({
    queryKey: ['emails', page, importance],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (importance) params.importance = importance;
      const { data } = await axios.get(`${API}/api/emails`, { headers: getHeaders(), params });
      return data;
    },
  });
}

export function useEmail(id: string | null) {
  return useQuery<Email>({
    queryKey: ['email', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API}/api/emails/${id}`, { headers: getHeaders() });
      return data;
    },
    enabled: !!id,
  });
}

export function useSyncEmails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`${API}/api/sync`, {}, { headers: getHeaders() });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useSummarizeEmail() {
  const queryClient = useQueryClient();
  return useMutation<EmailSummary, Error, string>({
    mutationFn: async (emailId: string) => {
      const { data } = await axios.post(`${API}/api/emails/${emailId}/summarize`, {}, { headers: getHeaders() });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const { data } = await axios.patch(`${API}/api/emails/${id}/read`, { isRead }, { headers: getHeaders() });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}
