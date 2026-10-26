import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import type { FiltroAdminDto } from './dto/filter-admin.dto.js';
import type { AtualizarUsuarioAdminDto } from './dto/update-admin.dto.js';
import type { FiltroEventoAdminDto } from './dto/filtro-evento-admin.dto.js';

const usuarioPublicoSelect = {
  id: true,
  nome: true,
  email: true,
  tipo: true,
  createdAt: true,
  updatedAt: true,
  senha: false,
} as const;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Usuários ----------

  async listarUsuarios(filtros: FiltroAdminDto) {
    const { page = 1, limit = 10, ...resto } = filtros;

    const where: Record<string, unknown> = {};

    if (resto.nome) {
      where.nome = {
        contains: resto.nome,
        mode: 'insensitive',
      };
    }

    if (resto.email) {
      where.email = {
        contains: resto.email,
        mode: 'insensitive',
      };
    }

    if (resto.tipo) {
      where.tipo = resto.tipo;
    }

    const [usuarios, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        where,
        select: usuarioPublicoSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      data: usuarios,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buscarUsuarioPorId(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: usuarioPublicoSelect,
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return usuario;
  }

  async atualizarUsuario(id: number, dados: AtualizarUsuarioAdminDto) {
    await this.buscarUsuarioPorId(id);

    if (dados.email !== undefined) {
      const existente = await this.prisma.usuario.findUnique({
        where: { email: dados.email },
      });

      if (existente && existente.id !== id) {
        throw new ConflictException('Já existe um usuário com esse e-mail.');
      }
    }

    return this.prisma.usuario.update({
      where: { id },
      data: {
        ...(dados.nome !== undefined && { nome: dados.nome }),
        ...(dados.email !== undefined && { email: dados.email }),
        ...(dados.tipo !== undefined && { tipo: dados.tipo }),
      },
      select: usuarioPublicoSelect,
    });
  }

  async deletarUsuario(id: number) {
    await this.buscarUsuarioPorId(id);

    const eventosDoUsuario = await this.prisma.evento.count({
      where: { usuarioId: id },
    });

    if (eventosDoUsuario > 0) {
      throw new BadRequestException(
        'Não é possível excluir um usuário que possui eventos vinculados. Remova ou reatribua os eventos primeiro.',
      );
    }

    await this.prisma.usuario.delete({
      where: { id },
    });

    return {
      mensagem: 'Usuário excluído com sucesso.',
    };
  }

  // ---------- Eventos ----------

  async listarEventos(filtros: FiltroEventoAdminDto) {
    const { page = 1, limit = 10, ...resto } = filtros;

    const where: Record<string, unknown> = {};

    if (resto.titulo) {
      where.titulo = {
        contains: resto.titulo,
        mode: 'insensitive',
      };
    }

    if (resto.local) {
      where.local = {
        contains: resto.local,
        mode: 'insensitive',
      };
    }

    if (resto.data) {
      where.data = new Date(resto.data);
    }

    if (resto.categoriaId !== undefined) {
      where.categoriaId = resto.categoriaId;
    }

    const [eventos, total] = await this.prisma.$transaction([
      this.prisma.evento.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          categoria: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { data: 'asc' },
      }),
      this.prisma.evento.count({ where }),
    ]);

    return {
      data: eventos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deletarEvento(id: number) {
    const evento = await this.prisma.evento.findUnique({
      where: { id },
    });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado.');
    }

    await this.prisma.evento.delete({
      where: { id },
    });

    return {
      mensagem: 'Evento excluído com sucesso.',
    };
  }

  // ---------- Categorias ----------

  async listarCategorias() {
    return this.prisma.categoria.findMany({
      include: {
        _count: {
          select: { eventos: true },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async deletarCategoria(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    const eventosVinculados = await this.prisma.evento.count({
      where: { categoriaId: id },
    });

    if (eventosVinculados > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma categoria que possui eventos vinculados.',
      );
    }

    await this.prisma.categoria.delete({
      where: { id },
    });

    return {
      mensagem: 'Categoria excluída com sucesso.',
    };
  }

  // ---------- Dashboard / Estatísticas ----------

  async dashboard() {
    const [
      totalUsuarios,
      totalEventos,
      totalCategorias,
      usuariosPorTipo,
    ] = await Promise.all([
      this.prisma.usuario.count(),
      this.prisma.evento.count(),
      this.prisma.categoria.count(),
      this.prisma.usuario.groupBy({
        by: ['tipo'],
        _count: {
          tipo: true,
        },
      }),
    ]);

    return {
      totalUsuarios,
      totalEventos,
      totalCategorias,
      usuariosPorTipo,
    };
  }
}
