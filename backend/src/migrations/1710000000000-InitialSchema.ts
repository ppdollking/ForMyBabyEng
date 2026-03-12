import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // users 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar' },
          { name: 'role', type: 'varchar', default: "'child'" },
          { name: 'nickname', type: 'varchar' },
          { name: 'parentId', type: 'int', isNullable: true },
          { name: 'points', type: 'int', default: 0 },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // users 자기 참조 FK (아이 → 부모)
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['parentId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // vocabulary_lists 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'vocabulary_lists',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'childId', type: 'int' },
          { name: 'name', type: 'varchar' },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'vocabulary_lists',
      new TableForeignKey({
        columnNames: ['childId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // words 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'words',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'listId', type: 'int' },
          { name: 'english', type: 'varchar' },
          { name: 'meaning', type: 'varchar' },
          { name: 'audioUrl', type: 'varchar', isNullable: true },
          { name: 'phonetic', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'words',
      new TableForeignKey({
        columnNames: ['listId'],
        referencedTableName: 'vocabulary_lists',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // test_results 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'test_results',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'childId', type: 'int' },
          { name: 'listId', type: 'int' },
          { name: 'testType', type: 'varchar' },
          { name: 'mode', type: 'varchar', isNullable: true },
          { name: 'score', type: 'float' },
          { name: 'pointsEarned', type: 'int', default: 0 },
          { name: 'totalQuestions', type: 'int' },
          { name: 'correctCount', type: 'int' },
          { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'test_results',
      new TableForeignKey({
        columnNames: ['childId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'test_results',
      new TableForeignKey({
        columnNames: ['listId'],
        referencedTableName: 'vocabulary_lists',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // test_word_results 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'test_word_results',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'testResultId', type: 'int' },
          { name: 'wordId', type: 'int' },
          { name: 'question', type: 'varchar' },
          { name: 'userAnswer', type: 'varchar' },
          { name: 'correctAnswer', type: 'varchar' },
          { name: 'isCorrect', type: 'tinyint', default: 0 },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'test_word_results',
      new TableForeignKey({
        columnNames: ['testResultId'],
        referencedTableName: 'test_results',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'test_word_results',
      new TableForeignKey({
        columnNames: ['wordId'],
        referencedTableName: 'words',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 의존성 역순으로 삭제
    await queryRunner.dropTable('test_word_results', true);
    await queryRunner.dropTable('test_results', true);
    await queryRunner.dropTable('words', true);
    await queryRunner.dropTable('vocabulary_lists', true);
    await queryRunner.dropTable('users', true);
  }
}
