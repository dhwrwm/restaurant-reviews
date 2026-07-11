import { Request } from 'express';
import { Role } from 'types';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}
