
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { EventosService } from './events.service.js';
import { CriarEventoDto } from './dto/create-event.dto.js';
import { FiltroEventoDto } from './dto/filter-events.dto.js';
import { AtualizarEventoDto } from './dto/update-event.dto.js';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  criar(@Body() dados: CriarEventoDto) {
    return this.eventosService.criar(dados);
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
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarEventoDto,
  ) {
    return this.eventosService.atualizar(id, dados);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deletar(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.deletar(id);
  }
}
