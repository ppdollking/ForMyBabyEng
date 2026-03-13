import { Injectable } from '@nestjs/common';
import { VocabularyListRepository } from './Repository/VocabularyList.repository';
import { WordRepository } from './Repository/Word.repository';
import { CreateListDto, CreateWordDto, UpdateWordDto } from './DTO/vocabulary.dtos';
import { STATUS_SUCC, ERR_LIST_NOT_FOUND, ERR_WORD_NOT_FOUND, ERR_NOT_CHILD_OF_PARENT, ERR_WORD_DUPLICATE } from '../DefsEnum';
import { wLogger } from '../util/logger/logger.winston.util';
import { UserRepository } from '../Service_User/Repository/User.repository';

@Injectable()
export class VocabularyService {
  constructor(
    private readonly listRepo: VocabularyListRepository,
    private readonly wordRepo: WordRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async createList(childId: number, dto: CreateListDto) {
    const list = await this.listRepo.insertList({ childId, name: dto.Name });
    wLogger.log(`Vocabulary list created | childId: ${childId}, name: ${dto.Name}`);
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
    const counts = await this.wordRepo.getRegistrationCountsByChildId(
      childId,
      words.map((word) => word.english),
    );

    return {
      statusCode: STATUS_SUCC,
      statusMsg: 'ok',
      data: {
        ...list,
        words: words.map((word) => ({
          ...word,
          registrationCount: counts[this.normalizeEnglish(word.english)] ?? 1,
        })),
      },
    };
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

    const english = dto.English.trim();
    const meaning = dto.Meaning.trim();
    const duplicated = await this.wordRepo.existsInListByEnglish(listId, english);
    if (duplicated) {
      return { statusCode: ERR_WORD_DUPLICATE, statusMsg: '이미 등록된 단어입니다.' };
    }

    const word = await this.wordRepo.insertWord({
      listId,
      english,
      meaning,
      audioUrl: dto.AudioUrl,
      phonetic: dto.Phonetic,
    });

    wLogger.log(`Vocabulary word added | listId: ${listId}, english: ${english}`);
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

    const nextEnglish = dto.English?.trim() ?? word.english;
    const nextMeaning = dto.Meaning?.trim() ?? word.meaning;
    const duplicated = await this.wordRepo.existsInListByEnglish(listId, nextEnglish, wordId);
    if (duplicated) {
      return { statusCode: ERR_WORD_DUPLICATE, statusMsg: '이미 등록된 단어입니다.' };
    }

    const updated = await this.wordRepo.updateWord(wordId, {
      english: nextEnglish,
      meaning: nextMeaning,
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

  async createListForParent(parentId: number, childId: number, dto: CreateListDto) {
    const ownershipError = await this.ensureParentOwnsChild(parentId, childId);
    if (ownershipError) return ownershipError;
    return this.createList(childId, dto);
  }

  async getListsForParent(parentId: number, childId: number) {
    const ownershipError = await this.ensureParentOwnsChild(parentId, childId);
    if (ownershipError) return ownershipError;
    return this.getLists(childId);
  }

  async getListForParent(parentId: number, childId: number, listId: number) {
    const ownershipError = await this.ensureParentOwnsChild(parentId, childId);
    if (ownershipError) return ownershipError;
    return this.getList(childId, listId);
  }

  async deleteListForParent(parentId: number, childId: number, listId: number) {
    const ownershipError = await this.ensureParentOwnsChild(parentId, childId);
    if (ownershipError) return ownershipError;
    return this.deleteList(childId, listId);
  }

  async addWordForParent(parentId: number, childId: number, listId: number, dto: CreateWordDto) {
    const ownershipError = await this.ensureParentOwnsChild(parentId, childId);
    if (ownershipError) return ownershipError;
    return this.addWord(childId, listId, dto);
  }

  async updateWordForParent(parentId: number, childId: number, listId: number, wordId: number, dto: UpdateWordDto) {
    const ownershipError = await this.ensureParentOwnsChild(parentId, childId);
    if (ownershipError) return ownershipError;
    return this.updateWord(childId, listId, wordId, dto);
  }

  async deleteWordForParent(parentId: number, childId: number, listId: number, wordId: number) {
    const ownershipError = await this.ensureParentOwnsChild(parentId, childId);
    if (ownershipError) return ownershipError;
    return this.deleteWord(childId, listId, wordId);
  }

  private async ensureParentOwnsChild(parentId: number, childId: number) {
    const child = await this.userRepo.getById(childId);
    if (!child || child.parentId !== parentId) {
      return { statusCode: ERR_NOT_CHILD_OF_PARENT, statusMsg: '해당 아이 계정을 찾을 수 없습니다.' };
    }

    return null;
  }

  private normalizeEnglish(english: string) {
    return english.trim().toLowerCase();
  }
}
