import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/utils/constants/roles/roles.constant';
import { ROLES_KEY } from 'src/utils/constants/roles/roles.constant';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);