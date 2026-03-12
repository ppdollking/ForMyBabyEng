import { Controller, Get, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../Service_Auth/jwt-auth.guard';
import { RolesGuard } from '../Service_Auth/roles.guard';
import { Roles } from '../Service_Auth/roles.decorator';
import { USER_ROLE } from '../DefsEnum';

@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(USER_ROLE.CHILD)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // 시험 결과 ID로 학습 피드백 생성
  @Get('test/:testId')
  generateFeedback(@Request() req, @Param('testId', ParseIntPipe) testId: number) {
    return this.feedbackService.generateFeedback(req.user.id, testId);
  }
}
