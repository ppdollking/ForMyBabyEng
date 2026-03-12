import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from '../../Service_User/Entity/user.entity';
import { VocabularyListEntity } from '../../Service_Vocabulary/Entity/vocabulary-list.entity';
import { TestWordResultEntity } from './test-word-result.entity';
import { TEST_TYPE, MEANING_TEST_MODE } from '../../DefsEnum';

@Entity('test_results')
export class TestResultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  childId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'childId' })
  child: UserEntity;

  @Column()
  listId: number;

  @ManyToOne(() => VocabularyListEntity)
  @JoinColumn({ name: 'listId' })
  list: VocabularyListEntity;

  @Column({ type: 'varchar' })
  testType: TEST_TYPE;

  @Column({ type: 'varchar', nullable: true })
  mode: MEANING_TEST_MODE;

  @Column({ type: 'float' })
  score: number;

  @Column({ default: 0 })
  pointsEarned: number;

  @Column()
  totalQuestions: number;

  @Column()
  correctCount: number;

  @OneToMany(() => TestWordResultEntity, (r) => r.testResult, { cascade: true })
  wordResults: TestWordResultEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
