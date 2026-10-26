import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import type { CommentDto } from './dto/comment.dto.js';
import type { RatingDto } from './dto/rating.dto.js';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class InteractionsService {
  constructor(private readonly prisma: PrismaService) {}

//  CRUD de Favoritos

  async createFavorite(userId: number, eventId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const event = await this.prisma.evento.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    const favorite = await this.prisma.favorito.findUnique({
      where: {
        usuarioId_eventoId: {
          usuarioId: userId,
          eventoId: eventId,
        },
      },
    });

    if (favorite) {
      throw new ConflictException('Evento já está nos favoritos.');
    }

    return this.prisma.favorito.create({
      data: {
        usuarioId: userId,
        eventoId: eventId,
      },
    });
  }

  async removeFavorite(userId: number, eventId: number) {
    const favorite = await this.prisma.favorito.findUnique({
      where: {
        usuarioId_eventoId: {
          usuarioId: userId,
          eventoId: eventId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito não encontrado.');
    }

    await this.prisma.favorito.delete({
      where: { id: favorite.id },
    });

    return {
      mensagem: 'Favorito removido com sucesso.',
    };
  }

  async listFavorites(userId: number) {
    return this.prisma.favorito.findMany({
      where: { usuarioId: userId },
      include: {
        evento: true,
      },
    });
  }

//   CRUD de Comentários

  async createComment(userId: number, eventId: number, dto: CommentDto) {
    const event = await this.prisma.evento.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    return this.prisma.comentario.create({
      data: {
        conteudo: dto.conteudo,
        usuarioId: userId,
        eventoId: eventId,
      },
    });
  }

  async updateComment(userId: number, commentId: number, dto: CommentDto) {
    const comment = await this.prisma.comentario.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado.');
    }

    if (comment.usuarioId !== userId) {
      throw new ForbiddenException('Você não pode editar este comentário.');
    }

    return this.prisma.comentario.update({
      where: { id: commentId },
      data: {
        conteudo: dto.conteudo,
      },
    });
  }

  async listComments(eventId: number) {
    return this.prisma.comentario.findMany({
      where: { eventoId: eventId },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }

  async deleteComment(userId: number, commentId: number) {
    const comment = await this.prisma.comentario.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado.');
    }

    if (comment.usuarioId !== userId) {
      throw new ForbiddenException('Você não pode excluir este comentário.');
    }

    await this.prisma.comentario.delete({
      where: { id: commentId },
    });

    return { mensagem: 'Comentário excluído com sucesso.' };
  }

//   CRUD de Avaliações

  async createRating(userId: number, eventId: number, dto: RatingDto) {
    const event = await this.prisma.evento.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    const rating = await this.prisma.avaliacao.findUnique({
      where: {
        usuarioId_eventoId: {
          usuarioId: userId,
          eventoId: eventId,
        },
      },
    });

    if (rating) {
      throw new ConflictException('Você já avaliou este evento.');
    }

    return this.prisma.avaliacao.create({
      data: {
        nota: dto.nota,
        usuarioId: userId,
        eventoId: eventId,
      },
    });
  }

  async updateRating(userId: number, eventId: number, dto: RatingDto) {
    const rating = await this.prisma.avaliacao.findUnique({
      where: {
        usuarioId_eventoId: {
          usuarioId: userId,
          eventoId: eventId,
        },
      },
    });

    if (!rating) {
      throw new NotFoundException('Avaliação não encontrada.');
    }

    return this.prisma.avaliacao.update({
      where: { id: rating.id },
      data: { nota: dto.nota },
    });
  }

  async deleteRating(userId: number, eventId: number) {
    const rating = await this.prisma.avaliacao.findUnique({
      where: {
        usuarioId_eventoId: {
          usuarioId: userId,
          eventoId: eventId,
        },
      },
    });

    if (!rating) {
      throw new NotFoundException('Avaliação não encontrada.');
    }

    await this.prisma.avaliacao.delete({
      where: { id: rating.id },
    });

    return {
      mensagem: 'Avaliação removida com sucesso.',
    };
  }

  async getEventRatings(eventId: number) {
    const event = await this.prisma.evento.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    const result = await this.prisma.avaliacao.aggregate({
      where: { eventoId: eventId },
      _avg: { nota: true },
      _count: { nota: true },
    });

    return {
      eventoId: eventId,
      media: result._avg.nota ?? 0,
      totalAvaliacoes: result._count.nota,
    };
  }
}
