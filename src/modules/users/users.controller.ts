
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { TipoUsuario } from '../../generated/prisma/client.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

import { UsuariosService } from './users.service.js';
import { UpdateUsuarioDto } from './dto/update-user.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

type AuthRequest = Request & {
  user: JwtPayload;
};

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles(TipoUsuario.ADMIN)
  @UseGuards(RolesGuard)
  findAll() {
    return this.usuariosService.findAll();
  }

  // Alteração da própria senha.
  @Patch('me/senha')
  alterarSenha(
    @Req() req: AuthRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usuariosService.alterarSenha(
      req.user.sub,
      dto.senhaAtual,
      dto.novaSenha,
    );
  }

  @Get(':id')
  findOne(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.validarAcesso(req.user, id);

    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    this.validarAcesso(req.user, id);

    return this.usuariosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(TipoUsuario.ADMIN)
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }

  private validarAcesso(usuario: JwtPayload, usuarioId: number) {
    const ehProprioUsuario = usuario.sub === usuarioId;
    const ehAdministrador = usuario.tipo === TipoUsuario.ADMIN;

    if (!ehProprioUsuario && !ehAdministrador) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este usuário.',
      );
    }
  }
}
