
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

import { CategoriasController } from './categories.controller.js';
import { CategoriasService } from './categories.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [CategoriasService],
})
export class CategoriesModule {}
