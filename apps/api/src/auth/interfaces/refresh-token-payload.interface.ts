import { Role } from 'types';

export interface RefreshTokenPayload {
  sub: string;
  role: Role;
  jti: string;
}
