import { UserRole } from '../enums/user-role.enum';

export interface RequestUser {
    id: string;
    email: string;
    roles: UserRole[];
}

export interface AuthenticatedRequest {
    user: RequestUser;
    [key: string]: any;
}
