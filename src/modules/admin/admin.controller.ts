
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service.js';
import { FiltroAdminDto } from './dto/filter-admin.dto.js';
import { AtualizarUsuarioAdminDto } from './dto/update-admin.dto.js';
import { FiltroEventoAdminDto } from './dto/filtro-evento-admin.dto.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ---------- Usuários ----------

  @Get('usuarios')
  listarUsuarios(@Query() filtros: FiltroAdminDto) {
    return this.adminService.listarUsuarios(filtros);
  }

  @Get('usuarios/:id')
  buscarUsuarioPorId(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.buscarUsuarioPorId(id);
  }

  @Patch('usuarios/:id')
  atualizarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarUsuarioAdminDto,
  ) {
    return this.adminService.atualizarUsuario(id, dados);
  }

  @Delete('usuarios/:id')
  @HttpCode(HttpStatus.OK)
  deletarUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletarUsuario(id);
  }

  // ---------- Eventos ----------

  @Get('eventos')
  listarEventos(@Query() filtros: FiltroEventoAdminDto) {
    return this.adminService.listarEventos(filtros);
  }

  @Delete('eventos/:id')
  @HttpCode(HttpStatus.OK)
  deletarEvento(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletarEvento(id);
  }

  // ---------- Categorias ----------

  @Get('categorias')
  listarCategorias() {
    return this.adminService.listarCategorias();
  }

  @Delete('categorias/:id')
  @HttpCode(HttpStatus.OK)
  deletarCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletarCategoria(id);
  }

  // ---------- Dashboard ----------

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }
}
