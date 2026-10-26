import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { InteractionsService } from './interactions.service.js';
import { CommentDto } from './dto/comment.dto.js';
import { RatingDto } from './dto/rating.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

type AuthRequest = Request & {
  user: JwtPayload;
};

@Controller('interactions')
export class InteractionsController {
  constructor(
    private readonly interactionsService: InteractionsService,
  ) {}

  // CRUD de Favoritos

  @Post('favorites/:eventId')
  @UseGuards(JwtAuthGuard)
  createFavorite(
    @Req() req: AuthRequest,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.interactionsService.createFavorite(
      req.user.sub,
      eventId,
    );
  }

  @Delete('favorites/:eventId')
  @UseGuards(JwtAuthGuard)
  removeFavorite(
    @Req() req: AuthRequest,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.interactionsService.removeFavorite(
      req.user.sub,
      eventId,
    );
  }

  @Get('favorites/me')
  @UseGuards(JwtAuthGuard)
  listFavorites(@Req() req: AuthRequest) {
    return this.interactionsService.listFavorites(req.user.sub);
  }

  // CRUD de Comentários

  @Post('comments/:eventId')
  @UseGuards(JwtAuthGuard)
  createComment(
    @Req() req: AuthRequest,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: CommentDto,
  ) {
    return this.interactionsService.createComment(
      req.user.sub,
      eventId,
      dto,
    );
  }

  @Get('comments/:eventId')
  listComments(
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.interactionsService.listComments(eventId);
  }

  @Put('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  updateComment(
    @Req() req: AuthRequest,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: CommentDto,
  ) {
    return this.interactionsService.updateComment(
      req.user.sub,
      commentId,
      dto,
    );
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Req() req: AuthRequest,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.interactionsService.deleteComment(
      req.user.sub,
      commentId,
    );
  }

  // CRUD de Avaliações

  @Post('ratings/:eventId')
  @UseGuards(JwtAuthGuard)
  createRating(
    @Req() req: AuthRequest,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: RatingDto,
  ) {
    return this.interactionsService.createRating(
      req.user.sub,
      eventId,
      dto,
    );
  }

  @Put('ratings/:eventId')
  @UseGuards(JwtAuthGuard)
  updateRating(
    @Req() req: AuthRequest,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() dto: RatingDto,
  ) {
    return this.interactionsService.updateRating(
      req.user.sub,
      eventId,
      dto,
    );
  }

  @Delete('ratings/:eventId')
  @UseGuards(JwtAuthGuard)
  deleteRating(
    @Req() req: AuthRequest,
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.interactionsService.deleteRating(
      req.user.sub,
      eventId,
    );
  }

  @Get('ratings/:eventId')
  getEventRatings(
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.interactionsService.getEventRatings(eventId);
  }
}