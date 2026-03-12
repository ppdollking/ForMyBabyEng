import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserEntity } from '../../Service_User/Entity/user.entity';

@Entity('vocabulary_lists')
export class VocabularyListEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  childId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'childId' })
  child: UserEntity;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}
