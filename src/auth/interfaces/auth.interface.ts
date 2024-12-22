import { UserRole } from "../../common/enums/user-role.enum";

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    roles: UserRole[];
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}
