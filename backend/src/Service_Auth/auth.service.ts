import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../Service_User/Repository/User.repository';
import { UserService } from '../Service_User/user.service';
import { LoginDto, RegisterParentDto, ChildLoginDto } from './DTO/auth.dtos';
import { USER_ROLE, STATUS_SUCC, ERR_USER_NOT_FOUND, ERR_INVALID_PASSWORD } from '../DefsEnum';
import { wLogger } from '../util/logger/logger.winston.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterParentDto) {
    return this.userService.createParent({ Email: dto.Email, Password: dto.Password, Nickname: dto.Nickname });
  }

  // 부모 로그인 (이메일 + 비밀번호)
  async login(dto: LoginDto) {
    const user = await this.userRepo.getByEmail(dto.Email);
    if (!user) {
      return { statusCode: ERR_USER_NOT_FOUND, statusMsg: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }
    const valid = await bcrypt.compare(dto.Password, user.password);
    if (!valid) {
      return { statusCode: ERR_INVALID_PASSWORD, statusMsg: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    wLogger.log(`부모 로그인 성공 | userId: ${user.id}`);
    return {
      statusCode: STATUS_SUCC,
      statusMsg: 'ok',
      data: { token, role: user.role, nickname: user.nickname, id: user.id },
    };
  }

  // 아이 로그인 (아이디 + 비밀번호)
  async loginChild(dto: ChildLoginDto) {
    const user = await this.userRepo.getByLoginId(dto.LoginId);
    if (!user || user.role !== USER_ROLE.CHILD) {
      return { statusCode: ERR_USER_NOT_FOUND, statusMsg: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }
    const valid = await bcrypt.compare(dto.Password, user.password);
    if (!valid) {
      return { statusCode: ERR_INVALID_PASSWORD, statusMsg: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }
    const token = this.jwtService.sign({ sub: user.id, loginId: user.loginId, role: user.role, parentId: user.parentId });
    wLogger.log(`아이 로그인 성공 | userId: ${user.id}, loginId: ${user.loginId}`);
    return {
      statusCode: STATUS_SUCC,
      statusMsg: 'ok',
      data: { token, role: user.role, nickname: user.nickname, id: user.id },
    };
  }
}
