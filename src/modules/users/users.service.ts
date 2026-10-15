import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUsuarioDto } from './dto/create-user.dto.js';
import { UpdateUsuarioDto } from './dto/update-user.dto.js';

const usuarioPublicoSelect = {
  id: true,
  nome: true,
  email: true,
  tipo: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

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
      where: {
        id,
      },
      select: usuarioPublicoSelect,
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    const dadosAtualizados = {
      nome: dto.nome,
      email: dto.email,
      senha: dto.senha ? await bcrypt.hash(dto.senha, 10) : undefined,
    };

    try {
      return await this.prisma.usuario.update({
        where: {
          id,
        },
        data: dadosAtualizados,
        select: usuarioPublicoSelect,
      });
    } catch (error) {
      this.tratarErroPrisma(error);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.usuario.delete({
        where: {
          id,
        },
        select: usuarioPublicoSelect,
      });
    } catch (error) {
      this.tratarErroPrisma(error);
    }
  }

  private tratarErroPrisma(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('E-mail já cadastrado');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Usuário não encontrado');
      }
    }

    throw error;
  }
}
