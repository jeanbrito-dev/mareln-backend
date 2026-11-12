
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  PayloadTooLargeException,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Express } from 'express';

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

@Injectable()
export class EventImageService {
  async salvar(
    arquivo: Express.Multer.File,
  ): Promise<{ imagemUrl: string }> {
    if (!arquivo?.buffer?.length) {
      throw new BadRequestException('Nenhuma imagem válida foi enviada.');
    }

    if (arquivo.size > TAMANHO_MAXIMO) {
      throw new PayloadTooLargeException(
        'A imagem deve ter no máximo 5 MB.',
      );
    }

    const tipo = this.identificarTipo(arquivo.buffer);

    if (!tipo || tipo.mime !== arquivo.mimetype) {
      throw new BadRequestException(
        'Arquivo inválido. Envie uma imagem JPEG, PNG ou WebP.',
      );
    }

    const diretorio =
      process.env.UPLOADS_DIR?.trim() ||
      join(process.cwd(), 'uploads');

    const nomeArquivo = `${randomUUID()}.${tipo.extensao}`;

    try {
      await mkdir(diretorio, { recursive: true });

      await writeFile(
        join(diretorio, nomeArquivo),
        arquivo.buffer,
        { flag: 'wx' },
      );
    } catch {
      throw new InternalServerErrorException(
        'Não foi possível salvar a imagem.',
      );
    }

    return {
      imagemUrl: `/uploads/${nomeArquivo}`,
    };
  }

  private identificarTipo(
    buffer: Buffer,
  ):
    | { mime: string; extensao: string }
    | null {
    // JPEG
    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return {
        mime: 'image/jpeg',
        extensao: 'jpg',
      };
    }

    // PNG
    if (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      )
    ) {
      return {
        mime: 'image/png',
        extensao: 'png',
      };
    }

    // WebP
    if (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      return {
        mime: 'image/webp',
        extensao: 'webp',
      };
    }

    return null;
  }
}
