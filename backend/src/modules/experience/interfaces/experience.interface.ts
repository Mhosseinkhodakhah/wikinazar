export interface ExperienceResponse {
  id: string;
  content: string;
  rating: number;
  likes: number;
  tags: string[];
  images: string[];
  authorId: string;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  subject?: {
    id: string;
    title: string;
    slug: string;
  };
}
