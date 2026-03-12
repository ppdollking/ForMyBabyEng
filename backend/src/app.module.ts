import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './Service_User/Entity/user.entity';
import { VocabularyListEntity } from './Service_Vocabulary/Entity/vocabulary-list.entity';
import { WordEntity } from './Service_Vocabulary/Entity/word.entity';
import { TestResultEntity } from './Service_Test/Entity/test-result.entity';
import { TestWordResultEntity } from './Service_Test/Entity/test-word-result.entity';
import { AuthModule } from './Service_Auth/auth.module';
import { UserModule } from './Service_User/user.module';
import { VocabularyModule } from './Service_Vocabulary/vocabulary.module';
import { TestModule } from './Service_Test/test.module';
import { DictionaryModule } from './Service_Dictionary/dictionary.module';
import { FeedbackModule } from './Service_Feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 개발(ts-node): src/config/env, 프로덕션(dist): dist/config/env 자동 선택
      envFilePath: [
        `src/config/env/.${process.env.NODE_ENV || 'local'}.env`,
        `dist/config/env/.${process.env.NODE_ENV || 'local'}.env`,
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [UserEntity, VocabularyListEntity, WordEntity, TestResultEntity, TestWordResultEntity],
        synchronize: false,      // 스키마는 마이그레이션으로만 관리
        migrationsRun: false,    // 자동 실행 금지 — 명시적으로 migration:run 실행
        logging: config.get<string>('NODE_ENV') === 'local',
      }),
    }),
    AuthModule,
    UserModule,
    VocabularyModule,
    TestModule,
    DictionaryModule,
    FeedbackModule,
  ],
})
export class AppModule {}
