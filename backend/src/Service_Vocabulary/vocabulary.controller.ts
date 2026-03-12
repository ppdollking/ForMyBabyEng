import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateListDto, CreateWordDto, UpdateWordDto } from './DTO/vocabulary.dtos';
import { JwtAuthGuard } from '../Service_Auth/jwt-auth.guard';
import { RolesGuard } from '../Service_Auth/roles.guard';
import { Roles } from '../Service_Auth/roles.decorator';
import { USER_ROLE } from '../DefsEnum';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(USER_ROLE.CHILD)
export class VocabularyController {
  constructor(private readonly vocabService: VocabularyService) {}

  @Post('lists')
  createList(@Request() req, @Body() dto: CreateListDto) {
    return this.vocabService.createList(req.user.id, dto);
  }

  @Get('lists')
  getLists(@Request() req) {
    return this.vocabService.getLists(req.user.id);
  }

  @Get('lists/:listId')
  getList(@Request() req, @Param('listId', ParseIntPipe) listId: number) {
    return this.vocabService.getList(req.user.id, listId);
  }

  @Delete('lists/:listId')
  deleteList(@Request() req, @Param('listId', ParseIntPipe) listId: number) {
    return this.vocabService.deleteList(req.user.id, listId);
  }

  @Post('lists/:listId/words')
  addWord(@Request() req, @Param('listId', ParseIntPipe) listId: number, @Body() dto: CreateWordDto) {
    return this.vocabService.addWord(req.user.id, listId, dto);
  }

  @Put('lists/:listId/words/:wordId')
  updateWord(
    @Request() req,
    @Param('listId', ParseIntPipe) listId: number,
    @Param('wordId', ParseIntPipe) wordId: number,
    @Body() dto: UpdateWordDto,
  ) {
    return this.vocabService.updateWord(req.user.id, listId, wordId, dto);
  }

  @Delete('lists/:listId/words/:wordId')
  deleteWord(
    @Request() req,
    @Param('listId', ParseIntPipe) listId: number,
    @Param('wordId', ParseIntPipe) wordId: number,
  ) {
    return this.vocabService.deleteWord(req.user.id, listId, wordId);
  }
}
