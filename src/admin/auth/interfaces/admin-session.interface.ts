import { UserRole } from "../../../common/enums/user-role.enum";

export interface AdminSession {
  id: string;
  email: string;
  roles: UserRole[];
  lastLogin?: Date;
}
