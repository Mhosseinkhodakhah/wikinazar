export interface FeedItemResponse {
  type: 'subject' | 'request';
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
  icon?: string | null;
  slug?: string;
  experienceCount?: number;
  votes?: number;
  status?: string;
  requesterId?: string;
  requester?: {
    id: string;
    username: string;
    displayName: string | null;
  } | null;
}
