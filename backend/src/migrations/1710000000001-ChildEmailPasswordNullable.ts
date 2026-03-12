import { MigrationInterface, QueryRunner } from 'typeorm';

// 아이 계정은 이메일/비밀번호 없이 이름만으로 생성하므로 nullable 처리
export class ChildEmailPasswordNullable1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` MODIFY \`email\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`users\` MODIFY \`password\` varchar(255) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ⚠️ 롤백 시 email/password가 NULL인 아이 계정이 있으면 실패할 수 있음
    await queryRunner.query(`ALTER TABLE \`users\` MODIFY \`email\` varchar(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`users\` MODIFY \`password\` varchar(255) NOT NULL`);
  }
}
