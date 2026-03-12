import { Injectable } from '@nestjs/common';
import { VocabularyListRepository } from './Repository/VocabularyList.repository';
import { WordRepository } from './Repository/Word.repository';
import { CreateListDto, CreateWordDto, UpdateWordDto } from './DTO/vocabulary.dtos';
import { STATUS_SUCC, ERR_LIST_NOT_FOUND, ERR_WORD_NOT_FOUND } from '../DefsEnum';
import { wLogger } from '../util/logger/logger.winston.util';

@Injectable()
export class VocabularyService {
  constructor(
    private readonly listRepo: VocabularyListRepository,
    private readonly wordRepo: WordRepository,
  ) {}

  async createList(childId: number, dto: CreateListDto) {
    const list = await this.listRepo.insertList({ childId, name: dto.Name });
    wLogger.log(`단어장 생성 | childId: ${childId}, name: ${dto.Name}`);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: list };
  }

  async getLists(childId: number) {
    const lists = await this.listRepo.getByChildId(childId);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: lists };
  }

  async getList(childId: number, listId: number) {
    const list = await this.listRepo.getById(listId);
    if (!list || list.childId !== childId) {
      return { statusCode: ERR_LIST_NOT_FOUND, statusMsg: '단어장을 찾을 수 없습니다.' };
    }
    const words = await this.wordRepo.getByListId(listId);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: { ...list, words } };
  }

  async deleteList(childId: number, listId: number) {
    const list = await this.listRepo.getById(listId);
    if (!list || list.childId !== childId) {
      return { statusCode: ERR_LIST_NOT_FOUND, statusMsg: '단어장을 찾을 수 없습니다.' };
    }
    await this.listRepo.deleteList(listId);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok' };
  }

  async addWord(childId: number, listId: number, dto: CreateWordDto) {
    const list = await this.listRepo.getById(listId);
    if (!list || list.childId !== childId) {
      return { statusCode: ERR_LIST_NOT_FOUND, statusMsg: '단어장을 찾을 수 없습니다.' };
    }
    const word = await this.wordRepo.insertWord({
      listId,
      english: dto.English,
      meaning: dto.Meaning,
      audioUrl: dto.AudioUrl,
      phonetic: dto.Phonetic,
    });
    wLogger.log(`단어 추가 | listId: ${listId}, english: ${dto.English}`);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: word };
  }

  async updateWord(childId: number, listId: number, wordId: number, dto: UpdateWordDto) {
    const list = await this.listRepo.getById(listId);
    if (!list || list.childId !== childId) {
      return { statusCode: ERR_LIST_NOT_FOUND, statusMsg: '단어장을 찾을 수 없습니다.' };
    }
    const word = await this.wordRepo.getById(wordId);
    if (!word || word.listId !== listId) {
      return { statusCode: ERR_WORD_NOT_FOUND, statusMsg: '단어를 찾을 수 없습니다.' };
    }
    const updated = await this.wordRepo.updateWord(wordId, {
      english: dto.English ?? word.english,
      meaning: dto.Meaning ?? word.meaning,
    });
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: updated };
  }

  async deleteWord(childId: number, listId: number, wordId: number) {
    const list = await this.listRepo.getById(listId);
    if (!list || list.childId !== childId) {
      return { statusCode: ERR_LIST_NOT_FOUND, statusMsg: '단어장을 찾을 수 없습니다.' };
    }
    await this.wordRepo.deleteWord(wordId);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok' };
  }
}
