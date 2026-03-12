import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UseGuards, Request } from '@nestjs/common';
import { TestService } from './test.service';
import { SubmitTestDto } from './DTO/test.dtos';
import { JwtAuthGuard } from '../Service_Auth/jwt-auth.guard';
import { RolesGuard } from '../Service_Auth/roles.guard';
import { Roles } from '../Service_Auth/roles.decorator';
import { USER_ROLE, TEST_TYPE, MEANING_TEST_MODE } from '../DefsEnum';

@Controller('test')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  // 시험 문제 생성
  @Get('generate')
  @Roles(USER_ROLE.CHILD)
  generateTest(
    @Request() req,
    @Query('listId', ParseIntPipe) listId: number,
    @Query('type') testType: TEST_TYPE,
    @Query('mode') mode: MEANING_TEST_MODE,
  ) {
    return this.testService.generateTest(req.user.id, listId, testType, mode);
  }

  // 시험 제출 및 채점
  @Post('submit')
  @Roles(USER_ROLE.CHILD)
  submitTest(@Request() req, @Body() dto: SubmitTestDto) {
    return this.testService.submitTest(req.user.id, dto);
  }

  // 내 시험 히스토리
  @Get('history')
  @Roles(USER_ROLE.CHILD)
  getHistory(@Request() req, @Query('listId') listId?: string) {
    return this.testService.getTestHistory(req.user.id, listId ? parseInt(listId) : undefined);
  }

  // 시험 상세
  @Get('history/:testId')
  @Roles(USER_ROLE.CHILD)
  getDetail(@Request() req, @Param('testId', ParseIntPipe) testId: number) {
    return this.testService.getTestDetail(req.user.id, testId);
  }

  // 부모: 자녀 시험 히스토리 조회
  @Get('children/:childId/history')
  @Roles(USER_ROLE.PARENT)
  getChildHistory(@Param('childId', ParseIntPipe) childId: number) {
    return this.testService.getChildTestHistory(childId);
  }
}
