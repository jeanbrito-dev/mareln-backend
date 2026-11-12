
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { TipoUsuario } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

import type { CriarEventoDto } from './dto/create-event.dto.js';
import type { FiltroEventoDto } from './dto/filter-events.dto.js';
import type { AtualizarEventoDto } from './dto/update-event.dto.js';

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(usuarioId: number, dados: CriarEventoDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
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

    const temLatitude = dados.latitude != null;
    const temLongitude = dados.longitude != null;

    if (temLatitude !== temLongitude) {
      throw new BadRequestException(
        'Informe latitude e longitude juntas.',
      );
    }

    if (
      temLatitude &&
      (!dados.cidade || !dados.precisaoLocalizacao)
    ) {
      throw new BadRequestException(
        'Informe cidade e precisão da localização junto com as coordenadas.',
      );
    }

    if (!temLatitude && dados.precisaoLocalizacao) {
      throw new BadRequestException(
        'A precisão da localização exige coordenadas.',
      );
    }

    return this.prisma.evento.create({
      data: {
        titulo: dados.titulo,
        descricao: dados.descricao,
        data: new Date(dados.data),
        local: dados.local,
        cidade: dados.cidade ?? null,
        latitude: dados.latitude ?? null,
        longitude: dados.longitude ?? null,
        precisaoLocalizacao: dados.precisaoLocalizacao ?? null,
        imagemUrl: dados.imagemUrl ?? null,
        usuarioId,
        categoriaId: dados.categoriaId,
      },
    });
  }

  // Consulta pública: somente eventos aprovados.
  async listar(filtros: FiltroEventoDto) {
    return this.prisma.evento.findMany({
      where: {
        status: 'APROVADO',
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
          },
        },
        categoria: true,
      },
      orderBy: {
        data: 'asc',
      },
    });
  }

  // Consulta privada: eventos do usuário autenticado.
  async listarMeus(usuarioId: number) {
    return this.prisma.evento.findMany({
      where: {
        usuarioId,
      },
      include: {
        categoria: true,
      },
      orderBy: {
        data: 'asc',
      },
    });
  }

  // Consulta pública individual: somente eventos aprovados.
  async buscarPorId(id: number) {
    const evento = await this.prisma.evento.findFirst({
      where: {
        id,
        status: 'APROVADO',
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
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

  async atualizar(
    id: number,
    solicitanteId: number,
    tipoUsuario: TipoUsuario,
    dados: AtualizarEventoDto,
  ) {
    const evento = await this.buscarPorIdInterno(id);

    this.validarPermissao(
      evento.usuarioId,
      solicitanteId,
      tipoUsuario,
    );

    if (dados.categoriaId !== undefined && dados.categoriaId !== null) {
      const categoria = await this.prisma.categoria.findUnique({
        where: { id: dados.categoriaId },
      });

      if (!categoria) {
        throw new NotFoundException('Categoria não encontrada.');
      }
    }

    const coordenadasFornecidas =
      dados.latitude !== undefined ||
      dados.longitude !== undefined;

    const localMudou =
      (dados.local !== undefined &&
        dados.local !== evento.local) ||
      (dados.cidade !== undefined &&
        dados.cidade !== evento.cidade);

    // Se o endereço mudar sem novas coordenadas,
    // as coordenadas antigas são removidas.
    const limparCoordenadas =
      localMudou && !coordenadasFornecidas;

    const latitudeFinal = limparCoordenadas
      ? null
      : dados.latitude !== undefined
        ? dados.latitude
        : evento.latitude;

    const longitudeFinal = limparCoordenadas
      ? null
      : dados.longitude !== undefined
        ? dados.longitude
        : evento.longitude;

    const cidadeFinal =
      dados.cidade !== undefined
        ? dados.cidade
        : evento.cidade;

    const precisaoFinal = limparCoordenadas
      ? null
      : dados.precisaoLocalizacao !== undefined
        ? dados.precisaoLocalizacao
        : evento.precisaoLocalizacao;

    const temLatitude = latitudeFinal !== null;
    const temLongitude = longitudeFinal !== null;

    if (temLatitude !== temLongitude) {
      throw new BadRequestException(
        'Informe latitude e longitude juntas.',
      );
    }

    if (
      temLatitude &&
      (!cidadeFinal || !precisaoFinal)
    ) {
      throw new BadRequestException(
        'Informe cidade e precisão da localização junto com as coordenadas.',
      );
    }

    if (!temLatitude && precisaoFinal !== null) {
      throw new BadRequestException(
        'A precisão da localização exige coordenadas.',
      );
    }

    const dataFinal =
      dados.data !== undefined
        ? new Date(dados.data)
        : evento.data;

    const imagemUrlFinal =
      dados.imagemUrl !== undefined
        ? dados.imagemUrl
        : evento.imagemUrl;

    // Verifica se realmente houve alguma alteração.
    const houveAlteracao =
      (dados.titulo !== undefined &&
        dados.titulo !== evento.titulo) ||
      (dados.descricao !== undefined &&
        dados.descricao !== evento.descricao) ||
      dataFinal.getTime() !== evento.data.getTime() ||
      (dados.local !== undefined &&
        dados.local !== evento.local) ||
      cidadeFinal !== evento.cidade ||
      latitudeFinal !== evento.latitude ||
      longitudeFinal !== evento.longitude ||
      precisaoFinal !== evento.precisaoLocalizacao ||
      (dados.categoriaId !== undefined &&
        dados.categoriaId !== evento.categoriaId) ||
      imagemUrlFinal !== evento.imagemUrl;

    try {
      return await this.prisma.evento.update({
        where: { id },
        data: {
          ...(dados.imagemUrl !== undefined && {
            imagemUrl: dados.imagemUrl,
          }),

          ...(dados.titulo !== undefined && {
            titulo: dados.titulo,
          }),

          ...(dados.descricao !== undefined && {
            descricao: dados.descricao,
          }),

          ...(dados.data !== undefined && {
            data: dataFinal,
          }),

          ...(dados.local !== undefined && {
            local: dados.local,
          }),

          ...(dados.categoriaId !== undefined && {
            categoriaId: dados.categoriaId,
          }),

          ...(dados.cidade !== undefined && {
            cidade: dados.cidade,
          }),

          latitude: latitudeFinal,
          longitude: longitudeFinal,
          precisaoLocalizacao: precisaoFinal,

          ...(limparCoordenadas && {
            latitude: null,
            longitude: null,
            precisaoLocalizacao: null,
          }),

          // Alterações feitas pelo divulgador precisam
          // passar novamente pela moderação.
          ...(tipoUsuario === 'DIVULGADOR' &&
            houveAlteracao && {
              status: 'PENDENTE',
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

  async deletar(
    id: number,
    solicitanteId: number,
    tipoUsuario: TipoUsuario,
  ) {
    const evento = await this.buscarPorIdInterno(id);

    this.validarPermissao(
      evento.usuarioId,
      solicitanteId,
      tipoUsuario,
    );

    await this.prisma.evento.delete({
      where: { id },
    });

    return {
      mensagem: 'Evento excluído com sucesso.',
    };
  }

  // Consulta interna para edição e exclusão de qualquer status.
  private async buscarPorIdInterno(id: number) {
    const evento = await this.prisma.evento.findUnique({
      where: { id },
      select: {
        id: true,
        usuarioId: true,
        titulo: true,
        descricao: true,
        data: true,
        local: true,
        cidade: true,
        latitude: true,
        longitude: true,
        precisaoLocalizacao: true,
        categoriaId: true,
        imagemUrl: true,
        status: true,
      },
    });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado.');
    }

    return evento;
  }

  private validarPermissao(
    proprietarioId: number,
    solicitanteId: number,
    tipoUsuario: TipoUsuario,
  ) {
    const ehProprietario = proprietarioId === solicitanteId;
    const ehAdministrador = tipoUsuario === 'ADMIN';

    if (!ehProprietario && !ehAdministrador) {
      throw new ForbiddenException(
        'Você não tem permissão para modificar este evento.',
      );
    }
  }
}
