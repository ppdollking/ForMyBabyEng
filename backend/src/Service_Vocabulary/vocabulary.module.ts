import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyListEntity } from './Entity/vocabulary-list.entity';
import { WordEntity } from './Entity/word.entity';
import { VocabularyListRepository } from './Repository/VocabularyList.repository';
import { WordRepository } from './Repository/Word.repository';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VocabularyListEntity, WordEntity])],
  providers: [VocabularyListRepository, WordRepository, VocabularyService],
  controllers: [VocabularyController],
  exports: [VocabularyService, WordRepository, VocabularyListRepository],
})
export class VocabularyModule {}
