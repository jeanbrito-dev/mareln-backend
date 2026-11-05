
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { TipoUsuario } from '../../generated/prisma/client.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

import { CategoriaDto } from './dto/categoria.dto.js';
import { CategoriasService } from './categories.service.js';

@Controller('categorias')
export class CategoriasController {
  constructor(
    private readonly categoriasService: CategoriasService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN)
  criar(@Body() dados: CategoriaDto) {
    return this.categoriasService.criar(dados.nome);
  }

  @Get()
  listar() {
    return this.categoriasService.listar();
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriasService.buscarPorId(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN)
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: CategoriaDto,
  ) {
    return this.categoriasService.atualizar(
      id,
      dados.nome,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN)
  deletar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriasService.deletar(id);
  }
}
