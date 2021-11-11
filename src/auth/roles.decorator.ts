import { UserRole } from '.prisma/client';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
