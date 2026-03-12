import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, Request, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateChildDto, AdjustPointsDto } from './DTO/user.dtos';
import { JwtAuthGuard } from '../Service_Auth/jwt-auth.guard';
import { RolesGuard } from '../Service_Auth/roles.guard';
import { Roles } from '../Service_Auth/roles.decorator';
import { USER_ROLE } from '../DefsEnum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMyProfile(@Request() req) {
    return this.userService.getMyProfile(req.user.id);
  }

  // 부모 전용: 자녀 계정 생성
  @Post('children')
  @Roles(USER_ROLE.PARENT)
  createChild(@Request() req, @Body() dto: CreateChildDto) {
    return this.userService.createChild(req.user.id, dto);
  }

  // 부모 전용: 자녀 목록 조회
  @Get('children')
  @Roles(USER_ROLE.PARENT)
  getChildren(@Request() req) {
    return this.userService.getChildren(req.user.id);
  }

  // 부모 전용: 자녀 상세 조회
  @Get('children/:childId')
  @Roles(USER_ROLE.PARENT)
  getChildDetail(@Request() req, @Param('childId', ParseIntPipe) childId: number) {
    return this.userService.getChildDetail(req.user.id, childId);
  }

  // 부모 전용: 자녀 포인트 조정 (delta 양수: 지급, 음수: 차감)
  @Put('children/:childId/points')
  @Roles(USER_ROLE.PARENT)
  adjustPoints(@Request() req, @Param('childId', ParseIntPipe) childId: number, @Body() dto: AdjustPointsDto) {
    return this.userService.adjustPoints(req.user.id, childId, dto);
  }
}
