import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type { TipoUsuario } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUsuarioDto } from '../users/dto/create-user.dto.js';
import { UsuariosService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import type {
  JwtPayload,
  RefreshTokenPayload,
} from './interfaces/jwt-payload.interface.js';
import { getJwtSecret, getRefreshTokenExpiration } from './jwt.config.js';

interface UsuarioParaToken {
  id: number;
  email: string;
  tipo: TipoUsuario;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async register(dto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(dto);

    return this.criarRespostaAutenticacao(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    return this.criarRespostaAutenticacao({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    });
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        dto.refreshToken,
        { secret: getJwtSecret() },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const usuario = await this.findAuthenticatedUser(payload.sub);

    return this.criarRespostaAutenticacao(usuario);
  }

  async findAuthenticatedUser(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return usuario;
  }

  private async criarRespostaAutenticacao<T extends UsuarioParaToken>(
    usuario: T,
  ) {
    const accessPayload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
      tokenType: 'access',
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: usuario.id,
      tokenType: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload),
      this.jwtService.signAsync(refreshPayload, {
        expiresIn: getRefreshTokenExpiration(),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      usuario,
    };
  }
}
