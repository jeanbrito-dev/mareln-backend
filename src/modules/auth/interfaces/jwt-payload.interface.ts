import type { TipoUsuario } from '../../../generated/prisma/client.js';

export interface JwtPayload {
  sub: number;
  email: string;
  tipo: TipoUsuario;
  tokenType: 'access';
  tokenVersion: number;
}

export interface RefreshTokenPayload {
  sub: number;
  tokenType: 'refresh';
  tokenVersion: number;
}

export interface ResetPasswordPayload {
  sub: number;
  email: string;
  tokenType: 'password_reset';
  tokenVersion: number;
}
