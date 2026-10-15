import { SetMetadata } from '@nestjs/common';

import type { TipoUsuario } from '../../../generated/prisma/client.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TipoUsuario[]) => SetMetadata(ROLES_KEY, roles);
