import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(nome: string) {
    const nomeValidado = nome?.trim();

    if (!nomeValidado) {
      throw new BadRequestException(
        'O nome da categoria é obrigatório.',
      );
    }

    const existente = await this.prisma.categoria.findUnique({
      where: { nome: nomeValidado },
    });

    if (existente) {
      throw new ConflictException(
        'Já existe uma categoria com esse nome.',
      );
    }

    return this.prisma.categoria.create({
      data: { nome: nomeValidado },
    });
  }

  async listar() {
    return this.prisma.categoria.findMany({
      include: {
        _count: {
          select: { eventos: true },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });
  }

  async buscarPorId(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: { eventos: true },
        },
      },
    });

    if (!categoria) {
      throw new NotFoundException(
        'Categoria não encontrada.',
      );
    }

    return categoria;
  }

  async atualizar(id: number, nome: string) {
    await this.buscarPorId(id);

    const nomeValidado = nome?.trim();

    if (!nomeValidado) {
      throw new BadRequestException(
        'O nome da categoria é obrigatório.',
      );
    }

    const existente = await this.prisma.categoria.findUnique({
      where: { nome: nomeValidado },
    });

    if (existente && existente.id !== id) {
      throw new ConflictException(
        'Já existe outra categoria com esse nome.',
      );
    }

    return this.prisma.categoria.update({
      where: { id },
      data: { nome: nomeValidado },
    });
  }

  async deletar(id: number) {
    await this.buscarPorId(id);

    const eventosVinculados = await this.prisma.evento.count({
      where: { categoriaId: id },
    });

    if (eventosVinculados > 0) {
      throw new ConflictException(
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
}
