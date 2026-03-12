import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { USER_ROLE } from '../../DefsEnum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 부모 계정만 사용, 아이 계정은 null
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  // 아이 계정 전용 로그인 ID (부모 계정은 null)
  @Column({ unique: true, nullable: true })
  loginId: string;

  @Column({ type: 'varchar', default: USER_ROLE.CHILD })
  role: USER_ROLE;

  @Column()
  nickname: string;

  // 아이 계정의 경우 부모 계정 참조
  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: UserEntity;

  @Column({ default: 0 })
  points: number;

  @CreateDateColumn()
  createdAt: Date;
}
