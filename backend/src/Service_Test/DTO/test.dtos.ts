import { IsNumber, IsString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TEST_TYPE, MEANING_TEST_MODE } from '../../DefsEnum';

export class WordAnswerDto {
  @IsNumber()
  WordId: number;

  @IsString()
  UserAnswer: string;
}

export class SubmitTestDto {
  @IsNumber()
  ListId: number;

  @IsEnum(TEST_TYPE)
  TestType: TEST_TYPE;

  @IsEnum(MEANING_TEST_MODE)
  Mode: MEANING_TEST_MODE;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WordAnswerDto)
  Answers: WordAnswerDto[];
}
