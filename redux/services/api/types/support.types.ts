export interface SupportTicket {
  id: number;
  subject: string;
  message_preview: string;
  created_at: string;
  status: string;
  user: {
    full_name: string;
    email: string;
    avatar_url: string | null;
    cop_id: string;
  };
}

export interface SupportTicketsResponse {
  tickets: SupportTicket[];
  total: number;
  page: number;
  page_size: number;
}