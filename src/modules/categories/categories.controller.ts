
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { CategoriasService } from './categories.service.js';

@Controller('categorias')
export class CategoriasController {
  constructor(
    private readonly categoriasService: CategoriasService,
  ) {}

  @Post()
  criar(@Body() dados: { nome: string }) {
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
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: { nome: string },
  ) {
    return this.categoriasService.atualizar(
      id,
      dados.nome,
    );
  }

  @Delete(':id')
  deletar(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoriasService.deletar(id);
  }
}
