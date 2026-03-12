import { IsString, IsOptional } from 'class-validator';

export class CreateListDto {
  @IsString()
  Name: string;
}

export class CreateWordDto {
  @IsString()
  English: string;

  @IsString()
  Meaning: string;

  @IsString()
  @IsOptional()
  AudioUrl?: string;

  @IsString()
  @IsOptional()
  Phonetic?: string;
}

export class UpdateWordDto {
  @IsString()
  @IsOptional()
  English?: string;

  @IsString()
  @IsOptional()
  Meaning?: string;
}
