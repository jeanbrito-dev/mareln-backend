import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { EventImageService } from '../events/event-image.service.js';

import { CreateUsuarioDto } from './dto/create-user.dto.js';
import { UpdateUsuarioDto } from './dto/update-user.dto.js';

const usuarioPublicoSelect = {
  id: true,
  nome: true,
  email: true,
  tipo: true,
  cidadePreferida: true,
  interesses: true,
  fotoPerfilUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventImageService: EventImageService,
  ) {}

  async create(dto: CreateUsuarioDto) {
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    try {
      return await this.prisma.usuario.create({
        data: {
          nome: dto.nome,
          email: dto.email,
          senha: senhaHash,
        },
        select: usuarioPublicoSelect,
      });
    } catch (error) {
      this.tratarErroPrisma(error);
    }
  }

  findAll() {
    return this.prisma.usuario.findMany({
      select: usuarioPublicoSelect,
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: usuarioPublicoSelect,
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    try {
      return await this.prisma.usuario.update({
        where: { id },
        data: {
          ...(dto.nome !== undefined && { nome: dto.nome }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.cidadePreferida !== undefined && {
            cidadePreferida: dto.cidadePreferida,
          }),
          ...(dto.interesses !== undefined && {
            interesses: dto.interesses,
          }),
        },
        select: usuarioPublicoSelect,
      });
    } catch (error) {
      this.tratarErroPrisma(error);
    }
  }

  async salvarFotoPerfil(id: number, arquivo: Express.Multer.File) {
    const resultadoUpload = await this.eventImageService.salvar(arquivo);

    try {
      const usuarioAtual = await this.prisma.usuario.findUnique({
        where: { id },
        select: { fotoPerfilUrl: true },
      });

      if (!usuarioAtual) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      const usuarioAtualizado = await this.prisma.usuario.update({
        where: { id },
        data: { fotoPerfilUrl: resultadoUpload.imagemUrl },
        select: usuarioPublicoSelect,
      });

      if (
        usuarioAtual.fotoPerfilUrl &&
        usuarioAtual.fotoPerfilUrl !== resultadoUpload.imagemUrl
      ) {
        await this.limparImagemSeNaoUtilizada(usuarioAtual.fotoPerfilUrl);
      }

      return usuarioAtualizado;
    } catch (error) {
      await this.eventImageService.remover(resultadoUpload.imagemUrl);
      throw error;
    }
  }

  async removerFotoPerfil(id: number) {
    const usuarioAtual = await this.prisma.usuario.findUnique({
      where: { id },
      select: { fotoPerfilUrl: true },
    });

    if (!usuarioAtual) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const usuarioAtualizado = await this.prisma.usuario.update({
      where: { id },
      data: { fotoPerfilUrl: null },
      select: usuarioPublicoSelect,
    });

    if (usuarioAtual.fotoPerfilUrl) {
      await this.limparImagemSeNaoUtilizada(usuarioAtual.fotoPerfilUrl);
    }

    return usuarioAtualizado;
  }

  async alterarSenha(
    id: number,
    senhaAtual: string,
    novaSenha: string,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        senha: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
      throw new BadRequestException('A senha atual está incorreta.');
    }

    const novaSenhaIgual = await bcrypt.compare(novaSenha, usuario.senha);

    if (novaSenhaIgual) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da senha atual.',
      );
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await this.prisma.usuario.update({
      where: { id },
      data: {
        senha: senhaHash,
        tokenVersion: { increment: 1 },
      },
    });

    return { mensagem: 'Senha alterada com sucesso.' };
  }

  async remove(id: number) {
    try {
      return await this.prisma.usuario.delete({
        where: { id },
        select: usuarioPublicoSelect,
      });
    } catch (error) {
      this.tratarErroPrisma(error);
    }
  }

  private async limparImagemSeNaoUtilizada(imagemUrl: string): Promise<void> {
    try {
      const [eventosComImagem, usuariosComImagem] = await Promise.all([
        this.prisma.evento.count({ where: { imagemUrl } }),
        this.prisma.usuario.count({ where: { fotoPerfilUrl: imagemUrl } }),
      ]);

      if (eventosComImagem === 0 && usuariosComImagem === 0) {
        await this.eventImageService.remover(imagemUrl);
      }
    } catch (error) {
      const motivo = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Não foi possível concluir a limpeza da imagem de perfil ${imagemUrl}: ${motivo}`,
      );
    }
  }

  private tratarErroPrisma(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('E-mail já cadastrado.');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Usuário não encontrado.');
      }
    }

    throw error;
  }
}
