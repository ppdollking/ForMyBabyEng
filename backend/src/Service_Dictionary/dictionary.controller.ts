import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { JwtAuthGuard } from '../Service_Auth/jwt-auth.guard';

@Controller('dictionary')
@UseGuards(JwtAuthGuard)
export class DictionaryController {
  constructor(private readonly dictService: DictionaryService) {}

  @Get(':word')
  lookup(@Param('word') word: string) {
    return this.dictService.lookup(word);
  }
}
