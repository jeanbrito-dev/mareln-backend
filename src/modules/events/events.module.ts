
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

import { EventosController } from './events.controller.js';
import { EventosService } from './events.service.js';
import { EventImageService } from './event-image.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EventosController],
  providers: [EventosService, EventImageService],
  exports: [EventosService],
})
export class EventsModule {}
