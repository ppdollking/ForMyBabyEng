import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../Entity/user.entity';
import { wLogger } from '../../util/logger/logger.winston.util';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async getById(id: number): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { email } });
  }

  async getChildrenByParentId(parentId: number): Promise<UserEntity[]> {
    return this.repo.find({ where: { parentId } });
  }

  async getByLoginId(loginId: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { loginId } });
  }

  async insertUser(data: Partial<UserEntity>): Promise<UserEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async updatePoints(id: number, delta: number): Promise<UserEntity | null> {
    const user = await this.getById(id);
    if (!user) return null;
    user.points = Math.max(0, user.points + delta);
    return this.repo.save(user);
  }

  async setPoints(id: number, points: number): Promise<UserEntity | null> {
    const user = await this.getById(id);
    if (!user) return null;
    user.points = Math.max(0, points);
    return this.repo.save(user);
  }
}
