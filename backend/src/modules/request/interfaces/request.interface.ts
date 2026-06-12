export interface RequestResponse {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  votes: number;
  status: string;
  requesterId: string;
  createdAt: Date;
  updatedAt: Date;
  requester?: {
    id: string;
    username: string;
    displayName: string | null;
  };
}
