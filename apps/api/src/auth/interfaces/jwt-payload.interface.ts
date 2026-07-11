import { Role } from 'types';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
