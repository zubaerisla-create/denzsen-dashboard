export interface ContentItem {
  id: number;
  title: string;
  type: 'Video' | 'Guide';
  description: string;
  thumbnail_url: string | null;
  media_url: string | null;
  duration: string | null;
  read_time: string | null;
  sections: Array<{
    title: string;
    content: string;
  }>;
  created_at: string;
}

export interface CreateVideoRequest {
  title: string;
  description: string;
  media_url: string;
  thumbnail_url?: string;
  duration: string;
}

export interface UpdateContentRequest {
  title?: string;
  description?: string;
  media_url?: string;
  thumbnail_url?: string | null;
  duration?: string;
  read_time?: string;
  sections?: Array<{
    title: string;
    content: string;
  }>;
}

export interface CreateGuideRequest {
  title: string;
  description: string;
  read_time: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  thumbnail_url?: string | null;
}