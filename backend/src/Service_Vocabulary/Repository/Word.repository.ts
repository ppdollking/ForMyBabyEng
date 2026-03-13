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

  async existsInListByEnglish(listId: number, english: string, excludeWordId?: number): Promise<boolean> {
    const query = this.repo
      .createQueryBuilder('word')
      .where('word.listId = :listId', { listId })
      .andWhere('LOWER(TRIM(word.english)) = :english', { english: english.trim().toLowerCase() });

    if (excludeWordId) {
      query.andWhere('word.id != :excludeWordId', { excludeWordId });
    }

    return (await query.getCount()) > 0;
  }

  async getRegistrationCountsByChildId(childId: number, englishWords: string[]): Promise<Record<string, number>> {
    const normalizedWords = [...new Set(englishWords.map((word) => word.trim().toLowerCase()).filter(Boolean))];
    if (normalizedWords.length === 0) return {};

    const rows = await this.repo
      .createQueryBuilder('word')
      .innerJoin('word.list', 'list')
      .select('LOWER(TRIM(word.english))', 'english')
      .addSelect('COUNT(*)', 'count')
      .where('list.childId = :childId', { childId })
      .andWhere('LOWER(TRIM(word.english)) IN (:...normalizedWords)', { normalizedWords })
      .groupBy('LOWER(TRIM(word.english))')
      .getRawMany<{ english: string; count: string }>();

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.english] = Number(row.count);
      return acc;
    }, {});
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
