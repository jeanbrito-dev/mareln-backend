
import {
  BadRequestException,
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import type { Request } from 'express';

import { TipoUsuario } from '../../generated/prisma/client.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

import { EventosService } from './events.service.js';
import { EventImageService } from './event-image.service.js';

import { CriarEventoDto } from './dto/create-event.dto.js';
import { FiltroEventoDto } from './dto/filter-events.dto.js';
import { AtualizarEventoDto } from './dto/update-event.dto.js';

type AuthRequest = Request & {
  user: JwtPayload;
};

const TIPOS_DE_IMAGEM = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

@Controller('eventos')
export class EventosController {
  constructor(
    private readonly eventosService: EventosService,
    private readonly eventImageService: EventImageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.DIVULGADOR, TipoUsuario.ADMIN)
  criar(@Req() req: AuthRequest, @Body() dados: CriarEventoDto) {
    return this.eventosService.criar(req.user.sub, dados);
  }

  @Post('imagem')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.DIVULGADOR, TipoUsuario.ADMIN)
  @UseInterceptors(
    FileInterceptor('imagem', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (_req, arquivo, callback) => {
        if (!TIPOS_DE_IMAGEM.includes(arquivo.mimetype)) {
          callback(
            new BadRequestException(
              'Formato não permitido. Envie JPEG, PNG ou WebP.',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  enviarImagem(@UploadedFile() arquivo: Express.Multer.File) {
    return this.eventImageService.salvar(arquivo);
  }

  @Get()
  listar(@Query() filtros: FiltroEventoDto) {
    return this.eventosService.listar(filtros);
  }

  @Get('meus')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.DIVULGADOR, TipoUsuario.ADMIN)
  listarMeus(@Req() req: AuthRequest) {
    return this.eventosService.listarMeus(req.user.sub);
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
