import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { EventImageService } from '../events/event-image.service.js';
import { UsuariosController } from './users.controller.js';
import { UsuariosService } from './users.service.js';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsuariosController],
  providers: [UsuariosService, EventImageService],
  exports: [UsuariosService],
})
export class UsersModule {}
