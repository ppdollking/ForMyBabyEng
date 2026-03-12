import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WordEntity } from '../Entity/word.entity';

@Injectable()
export class WordRepository {
  constructor(
    @InjectRepository(WordEntity)
    private readonly repo: Repository<WordEntity>,
  ) {}

  async getById(id: number): Promise<WordEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async getByListId(listId: number): Promise<WordEntity[]> {
    return this.repo.find({ where: { listId }, order: { createdAt: 'ASC' } });
  }

  async insertWord(data: Partial<WordEntity>): Promise<WordEntity> {
    return this.repo.save(this.repo.create(data));
  }

  async updateWord(id: number, data: Partial<WordEntity>): Promise<WordEntity | null> {
    await this.repo.update(id, data);
    return this.getById(id);
  }

  async deleteWord(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
