import { Module } from '@nestjs/common';
import { UsuariosController } from './users.controller.js';
import { UsuariosService } from './users.service.js';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsersModule {}
