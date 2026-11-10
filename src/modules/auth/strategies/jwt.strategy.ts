
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../../../prisma/prisma.service.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { getJwtSecret } from '../jwt.config.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (
      payload.tokenType !== 'access' ||
      !Number.isInteger(payload.tokenVersion)
    ) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        tokenVersion: true,
      },
    });

    if (
      !usuario ||
      usuario.tokenVersion !== payload.tokenVersion
    ) {
      throw new UnauthorizedException(
        'Sessão expirada. Faça login novamente.',
      );
    }

    return payload;
  }
}
