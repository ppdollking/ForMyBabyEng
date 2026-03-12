import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterParentDto, ChildLoginDto } from './DTO/auth.dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterParentDto) {
    return this.authService.register(dto);
  }

  // 부모 로그인: 이메일 + 비밀번호
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 아이 로그인: 아이디 + 비밀번호
  @Post('login/child')
  loginChild(@Body() dto: ChildLoginDto) {
    return this.authService.loginChild(dto);
  }
}
