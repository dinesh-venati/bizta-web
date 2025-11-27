import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

// Types
export interface DashboardSummary {
  date: string;
  totalConversationsToday: number;
  newConversationsToday: number;
  totalMessagesFromCustomersToday: number;
  totalMessagesFromBiztaToday: number;
  conversationsNeedingHuman: number;
  pendingFollowupsToday: number;
  topIntents: Array<{ intent: string; count: number }>;
}

export interface Conversation {
  id: string;
  customerPhone: string;
  customerName: string | null;
  lastMessageAt: string;
  intent: string | null;
  subIntent: string | null;
  leadScore: number | null;
  requiresHuman: boolean;
  channel: 'whatsapp';
  hasPendingFollowup: boolean;
}

export interface ConversationList {
  items: Conversation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  createdAt: string;
  handledBy: 'AI' | 'HUMAN' | null;
}

export interface ConversationDetail {
  id: string;
  customerPhone: string;
  customerName: string | null;
  intent: string | null;
  subIntent: string | null;
  leadScore: number | null;
  requiresHuman: boolean;
  channel: 'whatsapp';
  createdAt: string;
  lastMessageAt: string;
  followup: {
    hasPending: boolean;
    nextScheduledAt: string | null;
    lastSentAt: string | null;
  };
  messages: Message[];
}

export interface SendReplyRequest {
  message: string;
}

export interface SendReplyResponse {
  success: boolean;
  messageId: string;
  sentAt: string;
}

// API Functions
const fetchTodaySummary = async (date: 'today' | 'yesterday' | 'dayBeforeYesterday' = 'today'): Promise<DashboardSummary> => {
  const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary/today', {
    params: { date },
  });
  return data;
};

const fetchConversations = async (page = 1, pageSize = 20): Promise<ConversationList> => {
  const { data } = await apiClient.get<ConversationList>('/dashboard/conversations', {
    params: { page, pageSize },
  });
  return data;
};

const fetchConversationDetail = async (id: string): Promise<ConversationDetail> => {
  const { data } = await apiClient.get<ConversationDetail>(`/dashboard/conversations/${id}`);
  return data;
};

const sendReply = async (conversationId: string, message: string): Promise<SendReplyResponse> => {
  const { data } = await apiClient.post<SendReplyResponse>(
    `/dashboard/conversations/${conversationId}/reply`,
    { message }
  );
  return data;
};

// Hooks
export const useTodaySummary = (date: 'today' | 'yesterday' | 'dayBeforeYesterday' = 'today') => {
  return useQuery({
    queryKey: ['dashboard', 'summary', date],
    queryFn: () => fetchTodaySummary(date),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useConversations = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['dashboard', 'conversations', page, pageSize],
    queryFn: () => fetchConversations(page, pageSize),
  });
};

export const useConversationDetail = (id: string) => {
  return useQuery({
    queryKey: ['dashboard', 'conversation', id],
    queryFn: () => fetchConversationDetail(id),
    enabled: !!id,
  });
};

export const useSendReply = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => sendReply(conversationId, message),
    onSuccess: () => {
      // Invalidate conversation detail to refetch messages
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'conversation', conversationId],
      });
      // Also invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'conversations'],
      });
    },
  });
};
