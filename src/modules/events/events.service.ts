import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import type { CriarEventoDto } from './dto/create-event.dto.js';
import type { FiltroEventoDto } from './dto/filter-events.dto.js';
import type { AtualizarEventoDto } from './dto/update-event.dto.js';

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dados: CriarEventoDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: dados.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (dados.categoriaId !== undefined) {
      const categoria = await this.prisma.categoria.findUnique({
        where: { id: dados.categoriaId },
      });

      if (!categoria) {
        throw new NotFoundException('Categoria não encontrada.');
      }
    }

    return this.prisma.evento.create({
      data: {
        titulo: dados.titulo,
        descricao: dados.descricao,
        data: new Date(dados.data),
        local: dados.local,
        usuarioId: dados.usuarioId,
        categoriaId: dados.categoriaId,
      },
    });
  }

  async listar(filtros: FiltroEventoDto) {
    return this.prisma.evento.findMany({
      where: {
        ...(filtros.titulo && {
          titulo: {
            contains: filtros.titulo,
            mode: 'insensitive',
          },
        }),
        ...(filtros.local && {
          local: {
            contains: filtros.local,
            mode: 'insensitive',
          },
        }),
        ...(filtros.data && {
          data: new Date(filtros.data),
        }),
        ...(filtros.categoriaId !== undefined && {
          categoriaId: filtros.categoriaId,
        }),
      },
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
      orderBy: {
        data: 'asc',
      },
    });
  }

  async buscarPorId(id: number) {
    const evento = await this.prisma.evento.findUnique({
      where: { id },
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
    });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado.');
    }

    return evento;
  }

  async atualizar(id: number, dados: AtualizarEventoDto) {
    await this.buscarPorId(id);

    if (dados.usuarioId !== undefined) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: dados.usuarioId },
      });

      if (!usuario) {
        throw new NotFoundException('Usuário não encontrado.');
      }
    }

    if (dados.categoriaId !== undefined && dados.categoriaId !== null) {
      const categoria = await this.prisma.categoria.findUnique({
        where: { id: dados.categoriaId },
      });

      if (!categoria) {
        throw new NotFoundException('Categoria não encontrada.');
      }
    }

    try {
      return await this.prisma.evento.update({
        where: { id },
        data: {
          ...(dados.titulo !== undefined && {
            titulo: dados.titulo,
          }),
          ...(dados.descricao !== undefined && {
            descricao: dados.descricao,
          }),
          ...(dados.data !== undefined && {
            data: new Date(dados.data),
          }),
          ...(dados.local !== undefined && {
            local: dados.local,
          }),
          ...(dados.usuarioId !== undefined && {
            usuarioId: dados.usuarioId,
          }),
          ...(dados.categoriaId !== undefined && {
            categoriaId: dados.categoriaId,
          }),
        },
      });
    } catch (erro) {
      if (
        typeof erro === 'object' &&
        erro !== null &&
        'code' in erro &&
        erro.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não foi possível atualizar o relacionamento do evento.',
        );
      }

      throw erro;
    }
  }

  async deletar(id: number) {
    await this.buscarPorId(id);

    await this.prisma.evento.delete({
      where: { id },
    });

    return {
      mensagem: 'Evento excluído com sucesso.',
    };
  }
}
