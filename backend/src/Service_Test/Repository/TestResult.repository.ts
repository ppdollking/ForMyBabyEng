import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestResultEntity } from '../Entity/test-result.entity';

@Injectable()
export class TestResultRepository {
  constructor(
    @InjectRepository(TestResultEntity)
    private readonly repo: Repository<TestResultEntity>,
  ) {}

  async insertResult(data: Partial<TestResultEntity>): Promise<TestResultEntity> {
    return this.repo.save(this.repo.create(data));
  }

  async getByChildId(childId: number): Promise<TestResultEntity[]> {
    return this.repo.find({
      where: { childId },
      relations: ['list'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getByChildAndList(childId: number, listId: number): Promise<TestResultEntity[]> {
    return this.repo.find({
      where: { childId, listId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async getDetailById(id: number): Promise<TestResultEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['wordResults', 'wordResults.word', 'list'],
    });
  }
}
