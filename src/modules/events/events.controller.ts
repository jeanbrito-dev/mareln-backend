
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { TipoUsuario } from '../../generated/prisma/client.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

import { EventosService } from './events.service.js';
import { CriarEventoDto } from './dto/create-event.dto.js';
import { FiltroEventoDto } from './dto/filter-events.dto.js';
import { AtualizarEventoDto } from './dto/update-event.dto.js';

type AuthRequest = Request & {
  user: JwtPayload;
};

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.DIVULGADOR, TipoUsuario.ADMIN)
  criar(@Req() req: AuthRequest, @Body() dados: CriarEventoDto) {
    return this.eventosService.criar(req.user.sub, dados);
  }

  @Get()
  listar(@Query() filtros: FiltroEventoDto) {
    return this.eventosService.listar(filtros);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.buscarPorId(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.DIVULGADOR, TipoUsuario.ADMIN)
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
    @Body() dados: AtualizarEventoDto,
  ) {
    return this.eventosService.atualizar(
      id,
      req.user.sub,
      req.user.tipo,
      dados,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.DIVULGADOR, TipoUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  deletar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.eventosService.deletar(
      id,
      req.user.sub,
      req.user.tipo,
    );
  }
}
