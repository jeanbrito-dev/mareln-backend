
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

import { EventosController } from './events.controller.js';
import { EventosService } from './events.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EventosController],
  providers: [EventosService],
  exports: [EventosService],
})
export class EventsModule {}
