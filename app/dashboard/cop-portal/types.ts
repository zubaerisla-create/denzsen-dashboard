// types.ts
export interface VideoItem {
  id: number;
  title: string;
  description: string;
  duration: string;
  video_url: string;
  fileName: string;
  fileSize: string;
}

export interface GuideSection {
  id?: number;
  title: string;
  content: string;
}

export interface GuideItem {
  id: number;
  title: string;
  description: string;
  sections: GuideSection[];
  image_url?: string;
  resetTime: string;
}

export type Tab = 'video' | 'guide';

// Add new interfaces for API response
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