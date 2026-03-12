import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VocabularyListEntity } from './vocabulary-list.entity';

@Entity('words')
export class WordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  listId: number;

  @ManyToOne(() => VocabularyListEntity)
  @JoinColumn({ name: 'listId' })
  list: VocabularyListEntity;

  @Column()
  english: string;

  @Column()
  meaning: string;

  // Free Dictionary API에서 가져온 오디오 URL (없을 수 있음)
  @Column({ nullable: true })
  audioUrl: string;

  @Column({ nullable: true })
  phonetic: string;

  @CreateDateColumn()
  createdAt: Date;
}
