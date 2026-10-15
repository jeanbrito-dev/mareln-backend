import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { TipoUsuario } from '../../generated/prisma/client.js';
import { CreateUsuarioDto } from '../users/dto/create-user.dto.js';
import { AuthService } from './auth.service.js';
import { Roles } from './decorators/roles.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

type RequestComUsuario = Request & { user: JwtPayload };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUsuarioDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: RequestComUsuario) {
    return this.authService.findAuthenticatedUser(request.user.sub);
  }

  @Get('admin')
  @Roles(TipoUsuario.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  admin(@Req() request: RequestComUsuario) {
    return this.authService.findAuthenticatedUser(request.user.sub);
  }
}
