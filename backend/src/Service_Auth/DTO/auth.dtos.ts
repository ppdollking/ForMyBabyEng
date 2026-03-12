import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  Email: string;

  @IsString()
  @MinLength(4)
  Password: string;
}

export class ChildLoginDto {
  @IsString()
  LoginId: string;

  @IsString()
  @MinLength(4)
  Password: string;
}

export class RegisterParentDto {
  @IsEmail()
  Email: string;

  @IsString()
  @MinLength(6)
  Password: string;

  @IsString()
  Nickname: string;
}
