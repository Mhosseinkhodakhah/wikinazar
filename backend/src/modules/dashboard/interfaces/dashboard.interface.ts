import { type UserResponse } from '../../auth/interfaces/user.interface';
import { type ExperienceResponse } from '../../experience/interfaces/experience.interface';
import { type RequestResponse } from '../../request/interfaces/request.interface';

export interface DashboardResponse {
  profile: UserResponse;
  stats: {
    totalExperiences: number;
    totalRequests: number;
    averageRating: number;
  };
  recentExperiences: ExperienceResponse[];
  recentRequests: RequestResponse[];
}
