import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestResultEntity } from './Entity/test-result.entity';
import { TestWordResultEntity } from './Entity/test-word-result.entity';
import { TestResultRepository } from './Repository/TestResult.repository';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { VocabularyModule } from '../Service_Vocabulary/vocabulary.module';
import { UserModule } from '../Service_User/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([TestResultEntity, TestWordResultEntity]), VocabularyModule, UserModule],
  providers: [TestResultRepository, TestService],
  controllers: [TestController],
  exports: [TestResultRepository],
})
export class TestModule {}
