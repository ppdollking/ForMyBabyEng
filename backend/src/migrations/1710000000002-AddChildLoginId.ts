import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

// 아이 계정 전용 로그인 ID 컬럼 추가
export class AddChildLoginId1710000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({ name: 'loginId', type: 'varchar', isNullable: true, default: null }),
    );
    // loginId 고유 인덱스
    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'UQ_users_loginId', columnNames: ['loginId'], isUnique: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'UQ_users_loginId');
    await queryRunner.dropColumn('users', 'loginId');
  }
}
