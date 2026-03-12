import { IsString, IsEmail, MinLength, IsOptional, IsNumber } from 'class-validator';

export class CreateParentDto {
  @IsEmail()
  Email: string;

  @IsString()
  @MinLength(6)
  Password: string;

  @IsString()
  Nickname: string;
}

export class CreateChildDto {
  @IsString()
  LoginId: string;

  @IsString()
  @MinLength(4)
  Password: string;

  @IsString()
  Nickname: string;
}

export class AdjustPointsDto {
  @IsNumber()
  Delta: number; // 양수: 지급, 음수: 차감

  @IsString()
  @IsOptional()
  Reason?: string;
}
