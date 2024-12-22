import { UserRole } from "../../../common/enums/user-role.enum";

export interface AdminAuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    roles: UserRole[];
  };
}

export interface AdminLoginDto {
  email: string;
  password: string;
}
