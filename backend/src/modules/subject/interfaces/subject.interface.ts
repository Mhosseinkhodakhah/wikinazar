export interface SubjectResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  images: string[] | null;
  experienceCount: number;
  createdAt: Date;
  updatedAt: Date;
}
