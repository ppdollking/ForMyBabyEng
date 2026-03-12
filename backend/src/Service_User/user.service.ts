import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './Repository/User.repository';
import { CreateParentDto, CreateChildDto, AdjustPointsDto } from './DTO/user.dtos';
import { USER_ROLE, STATUS_SUCC, ERR_USER_NOT_FOUND, ERR_USER_DUPLICATE, ERR_NOT_CHILD_OF_PARENT } from '../DefsEnum';
import { wLogger } from '../util/logger/logger.winston.util';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async createParent(dto: CreateParentDto) {
    const exists = await this.userRepo.getByEmail(dto.Email);
    if (exists) {
      return { statusCode: ERR_USER_DUPLICATE, statusMsg: '이미 사용 중인 이메일입니다.' };
    }
    const hashed = await bcrypt.hash(dto.Password, 10);
    const user = await this.userRepo.insertUser({
      email: dto.Email,
      password: hashed,
      nickname: dto.Nickname,
      role: USER_ROLE.PARENT,
    });
    wLogger.log(`부모 계정 생성 | email: ${dto.Email}`);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: this.sanitize(user) };
  }

  async createChild(parentId: number, dto: CreateChildDto) {
    // loginId 전체 고유 여부 확인
    const idExists = await this.userRepo.getByLoginId(dto.LoginId);
    if (idExists) {
      return { statusCode: ERR_USER_DUPLICATE, statusMsg: '이미 사용 중인 아이디입니다.' };
    }
    const hashed = await bcrypt.hash(dto.Password, 4);
    const user = await this.userRepo.insertUser({
      loginId: dto.LoginId,
      password: hashed,
      nickname: dto.Nickname,
      role: USER_ROLE.CHILD,
      parentId,
    });
    wLogger.log(`아이 계정 생성 | parentId: ${parentId}, loginId: ${dto.LoginId}`);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: this.sanitize(user) };
  }

  async getChildren(parentId: number) {
    const children = await this.userRepo.getChildrenByParentId(parentId);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: children.map(this.sanitize) };
  }

  async getChildDetail(parentId: number, childId: number) {
    const child = await this.userRepo.getById(childId);
    if (!child || child.parentId !== parentId) {
      return { statusCode: ERR_NOT_CHILD_OF_PARENT, statusMsg: '해당 아이 계정을 찾을 수 없습니다.' };
    }
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: this.sanitize(child) };
  }

  async adjustPoints(parentId: number, childId: number, dto: AdjustPointsDto) {
    const child = await this.userRepo.getById(childId);
    if (!child || child.parentId !== parentId) {
      return { statusCode: ERR_NOT_CHILD_OF_PARENT, statusMsg: '해당 아이 계정을 찾을 수 없습니다.' };
    }
    const updated = await this.userRepo.updatePoints(childId, dto.Delta);
    wLogger.log(`포인트 조정 | childId: ${childId}, delta: ${dto.Delta}, reason: ${dto.Reason}`);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: this.sanitize(updated) };
  }

  async getMyProfile(userId: number) {
    const user = await this.userRepo.getById(userId);
    if (!user) return { statusCode: ERR_USER_NOT_FOUND, statusMsg: '유저를 찾을 수 없습니다.' };
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: this.sanitize(user) };
  }

  // 비밀번호 제외 후 반환
  private sanitize(user: any) {
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }
}
