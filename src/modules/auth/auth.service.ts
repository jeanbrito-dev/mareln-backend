
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type { TipoUsuario } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUsuarioDto } from '../users/dto/create-user.dto.js';
import { UsuariosService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RecuperarSenhaDto } from './dto/recuperar-senha.dto.js';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto.js';
import type {
  JwtPayload,
  RefreshTokenPayload,
  ResetPasswordPayload,
} from './interfaces/jwt-payload.interface.js';
import { getJwtSecret, getRefreshTokenExpiration } from './jwt.config.js';

interface UsuarioParaToken {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  tokenVersion: number;
  createdAt?: Date;
  updatedAt?: Date;
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

    const usuarioAutenticado = await this.findAuthenticatedUser(
      usuario.id,
    );

    return this.criarRespostaAutenticacao(usuarioAutenticado);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        tipo: true,
        tokenVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(
      dto.senha,
      usuario.senha,
    );

    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    return this.criarRespostaAutenticacao({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      tokenVersion: usuario.tokenVersion,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
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
      throw new UnauthorizedException(
        'Refresh token inválido ou expirado',
      );
    }

    if (
      payload.tokenType !== 'refresh' ||
      !Number.isInteger(payload.tokenVersion)
    ) {
      throw new UnauthorizedException(
        'Refresh token inválido ou expirado',
      );
    }

    const usuario = await this.findAuthenticatedUser(payload.sub);

    if (payload.tokenVersion !== usuario.tokenVersion) {
      throw new UnauthorizedException(
        'Sessão expirada. Faça login novamente.',
      );
    }

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
        tokenVersion: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return usuario;
  }

  private async criarRespostaAutenticacao(
    usuario: UsuarioParaToken,
  ) {
    const accessPayload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
      tokenType: 'access',
      tokenVersion: usuario.tokenVersion,
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: usuario.id,
      tokenType: 'refresh',
      tokenVersion: usuario.tokenVersion,
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
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        ...(usuario.createdAt && {
          createdAt: usuario.createdAt,
        }),
        ...(usuario.updatedAt && {
          updatedAt: usuario.updatedAt,
        }),
      },
    };
  }

  async recuperarSenha(dto: RecuperarSenhaDto) {
    const emailNormalizado = dto.email.trim().toLowerCase();

    const usuario = await this.prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      select: {
        id: true,
        nome: true,
        email: true,
        tokenVersion: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Nenhum usuário cadastrado com este e-mail.');
    }

    const resetPayload: ResetPasswordPayload = {
      sub: usuario.id,
      email: usuario.email,
      tokenType: 'password_reset',
      tokenVersion: usuario.tokenVersion,
    };

    const token = await this.jwtService.signAsync(resetPayload, {
      expiresIn: '1h',
    });

    return {
      mensagem: 'Instruções para redefinição de senha geradas com sucesso.',
      email: usuario.email,
      token,
    };
  }

  async redefinirSenha(dto: RedefinirSenhaDto) {
    let payload: ResetPasswordPayload;

    try {
      payload = await this.jwtService.verifyAsync<ResetPasswordPayload>(
        dto.token,
        { secret: getJwtSecret() },
      );
    } catch {
      throw new BadRequestException(
        'Token de recuperação inválido ou expirado.',
      );
    }

    if (
      payload.tokenType !== 'password_reset' ||
      !Number.isInteger(payload.sub) ||
      !Number.isInteger(payload.tokenVersion)
    ) {
      throw new BadRequestException('Token de recuperação inválido.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        senha: true,
        tokenVersion: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (payload.tokenVersion !== usuario.tokenVersion) {
      throw new BadRequestException(
        'Este link de recuperação já foi utilizado ou expirou.',
      );
    }

    const senhaIgual = await bcrypt.compare(dto.novaSenha, usuario.senha);
    if (senhaIgual) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da senha anterior.',
      );
    }

    const novaSenhaHash = await bcrypt.hash(dto.novaSenha, 10);

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: novaSenhaHash,
        tokenVersion: { increment: 1 },
      },
    });

    return {
      mensagem: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
    };
  }
}
