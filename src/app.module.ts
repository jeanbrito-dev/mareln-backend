import 'dotenv/config';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { PrismaModule } from './prisma/prisma.module.js';

import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { EventsModule } from './modules/events/events.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { InteractionsModule } from './modules/interactions/interactions.module.js';
import { AdminModule } from './modules/admin/admin.module.js';

@Module({
  imports: [
    PrismaModule,

    AuthModule,
    UsersModule,
    EventsModule,
    CategoriesModule,
    InteractionsModule,
    AdminModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
