import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TestResultEntity } from './test-result.entity';
import { WordEntity } from '../../Service_Vocabulary/Entity/word.entity';

@Entity('test_word_results')
export class TestWordResultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  testResultId: number;

  @ManyToOne(() => TestResultEntity, (r) => r.wordResults)
  @JoinColumn({ name: 'testResultId' })
  testResult: TestResultEntity;

  @Column()
  wordId: number;

  @ManyToOne(() => WordEntity)
  @JoinColumn({ name: 'wordId' })
  word: WordEntity;

  @Column()
  question: string;

  @Column()
  userAnswer: string;

  @Column()
  correctAnswer: string;

  @Column({ default: false })
  isCorrect: boolean;
}
