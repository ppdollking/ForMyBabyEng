import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateListDto, CreateWordDto, UpdateWordDto } from './DTO/vocabulary.dtos';
import { JwtAuthGuard } from '../Service_Auth/jwt-auth.guard';
import { RolesGuard } from '../Service_Auth/roles.guard';
import { Roles } from '../Service_Auth/roles.decorator';
import { USER_ROLE } from '../DefsEnum';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VocabularyController {
  constructor(private readonly vocabService: VocabularyService) {}

  @Post('lists')
  @Roles(USER_ROLE.CHILD)
  createList(@Request() req, @Body() dto: CreateListDto) {
    return this.vocabService.createList(req.user.id, dto);
  }

  @Get('lists')
  @Roles(USER_ROLE.CHILD)
  getLists(@Request() req) {
    return this.vocabService.getLists(req.user.id);
  }

  @Get('lists/:listId')
  @Roles(USER_ROLE.CHILD)
  getList(@Request() req, @Param('listId', ParseIntPipe) listId: number) {
    return this.vocabService.getList(req.user.id, listId);
  }

  @Delete('lists/:listId')
  @Roles(USER_ROLE.CHILD)
  deleteList(@Request() req, @Param('listId', ParseIntPipe) listId: number) {
    return this.vocabService.deleteList(req.user.id, listId);
  }

  @Post('lists/:listId/words')
  @Roles(USER_ROLE.CHILD)
  addWord(@Request() req, @Param('listId', ParseIntPipe) listId: number, @Body() dto: CreateWordDto) {
    return this.vocabService.addWord(req.user.id, listId, dto);
  }

  @Put('lists/:listId/words/:wordId')
  @Roles(USER_ROLE.CHILD)
  updateWord(
    @Request() req,
    @Param('listId', ParseIntPipe) listId: number,
    @Param('wordId', ParseIntPipe) wordId: number,
    @Body() dto: UpdateWordDto,
  ) {
    return this.vocabService.updateWord(req.user.id, listId, wordId, dto);
  }

  @Delete('lists/:listId/words/:wordId')
  @Roles(USER_ROLE.CHILD)
  deleteWord(
    @Request() req,
    @Param('listId', ParseIntPipe) listId: number,
    @Param('wordId', ParseIntPipe) wordId: number,
  ) {
    return this.vocabService.deleteWord(req.user.id, listId, wordId);
  }

  @Post('children/:childId/lists')
  @Roles(USER_ROLE.PARENT)
  createListForParent(@Request() req, @Param('childId', ParseIntPipe) childId: number, @Body() dto: CreateListDto) {
    return this.vocabService.createListForParent(req.user.id, childId, dto);
  }

  @Get('children/:childId/lists')
  @Roles(USER_ROLE.PARENT)
  getListsForParent(@Request() req, @Param('childId', ParseIntPipe) childId: number) {
    return this.vocabService.getListsForParent(req.user.id, childId);
  }

  @Get('children/:childId/lists/:listId')
  @Roles(USER_ROLE.PARENT)
  getListForParent(
    @Request() req,
    @Param('childId', ParseIntPipe) childId: number,
    @Param('listId', ParseIntPipe) listId: number,
  ) {
    return this.vocabService.getListForParent(req.user.id, childId, listId);
  }

  @Delete('children/:childId/lists/:listId')
  @Roles(USER_ROLE.PARENT)
  deleteListForParent(
    @Request() req,
    @Param('childId', ParseIntPipe) childId: number,
    @Param('listId', ParseIntPipe) listId: number,
  ) {
    return this.vocabService.deleteListForParent(req.user.id, childId, listId);
  }

  @Post('children/:childId/lists/:listId/words')
  @Roles(USER_ROLE.PARENT)
  addWordForParent(
    @Request() req,
    @Param('childId', ParseIntPipe) childId: number,
    @Param('listId', ParseIntPipe) listId: number,
    @Body() dto: CreateWordDto,
  ) {
    return this.vocabService.addWordForParent(req.user.id, childId, listId, dto);
  }

  @Put('children/:childId/lists/:listId/words/:wordId')
  @Roles(USER_ROLE.PARENT)
  updateWordForParent(
    @Request() req,
    @Param('childId', ParseIntPipe) childId: number,
    @Param('listId', ParseIntPipe) listId: number,
    @Param('wordId', ParseIntPipe) wordId: number,
    @Body() dto: UpdateWordDto,
  ) {
    return this.vocabService.updateWordForParent(req.user.id, childId, listId, wordId, dto);
  }

  @Delete('children/:childId/lists/:listId/words/:wordId')
  @Roles(USER_ROLE.PARENT)
  deleteWordForParent(
    @Request() req,
    @Param('childId', ParseIntPipe) childId: number,
    @Param('listId', ParseIntPipe) listId: number,
    @Param('wordId', ParseIntPipe) wordId: number,
  ) {
    return this.vocabService.deleteWordForParent(req.user.id, childId, listId, wordId);
  }
}
