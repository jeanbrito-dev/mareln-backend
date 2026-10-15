import type { JwtModuleOptions } from '@nestjs/jwt';

type JwtExpiration = NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('A variável JWT_SECRET não foi configurada');
  }

  return secret;
}

export function getJwtExpiration(): JwtExpiration {
  return (process.env.JWT_EXPIRES_IN ?? '15m') as JwtExpiration;
}

export function getRefreshTokenExpiration(): JwtExpiration {
  return (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as JwtExpiration;
}
