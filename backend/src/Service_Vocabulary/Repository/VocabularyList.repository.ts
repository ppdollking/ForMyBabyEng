import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyListEntity } from '../Entity/vocabulary-list.entity';

@Injectable()
export class VocabularyListRepository {
  constructor(
    @InjectRepository(VocabularyListEntity)
    private readonly repo: Repository<VocabularyListEntity>,
  ) {}

  async getById(id: number): Promise<VocabularyListEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async getByChildId(childId: number): Promise<VocabularyListEntity[]> {
    return this.repo.find({ where: { childId }, order: { createdAt: 'DESC' } });
  }

  async insertList(data: Partial<VocabularyListEntity>): Promise<VocabularyListEntity> {
    return this.repo.save(this.repo.create(data));
  }

  async deleteList(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
