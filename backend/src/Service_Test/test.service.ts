import { Injectable } from '@nestjs/common';
import { TestResultRepository } from './Repository/TestResult.repository';
import { VocabularyListRepository } from '../Service_Vocabulary/Repository/VocabularyList.repository';
import { WordRepository } from '../Service_Vocabulary/Repository/Word.repository';
import { UserRepository } from '../Service_User/Repository/User.repository';
import { SubmitTestDto } from './DTO/test.dtos';
import { TEST_TYPE, MEANING_TEST_MODE, STATUS_SUCC, ERR_LIST_NOT_FOUND, POINT_PERFECT_SCORE } from '../DefsEnum';
import { wLogger } from '../util/logger/logger.winston.util';

@Injectable()
export class TestService {
  constructor(
    private readonly testResultRepo: TestResultRepository,
    private readonly listRepo: VocabularyListRepository,
    private readonly wordRepo: WordRepository,
    private readonly userRepo: UserRepository,
  ) {}

  /**
   * 시험 문제 생성: 단어장의 단어들로 문제를 만들어 반환
   * 빈칸 방식: 단어의 일부를 '_'로 마스킹
   */
  async generateTest(childId: number, listId: number, testType: TEST_TYPE, mode: MEANING_TEST_MODE) {
    const list = await this.listRepo.getById(listId);
    if (!list || list.childId !== childId) {
      return { statusCode: ERR_LIST_NOT_FOUND, statusMsg: '단어장을 찾을 수 없습니다.' };
    }
    const words = await this.wordRepo.getByListId(listId);
    if (words.length === 0) {
      return { statusCode: ERR_LIST_NOT_FOUND, statusMsg: '단어장에 단어가 없습니다.' };
    }

    const questions = words.map((word) => {
      if (testType === TEST_TYPE.BLANK) {
        return {
          wordId: word.id,
          question: this.maskWord(word.english),
          hint: word.meaning,
          answer: word.english,
        };
      } else {
        // 뜻↔단어 모드
        if (mode === MEANING_TEST_MODE.MEANING_TO_WORD) {
          return { wordId: word.id, question: word.meaning, hint: null, answer: word.english };
        } else {
          return { wordId: word.id, question: word.english, hint: null, answer: word.meaning };
        }
      }
    });

    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: { listId, testType, mode, questions } };
  }

  async submitTest(childId: number, dto: SubmitTestDto) {
    const list = await this.listRepo.getById(dto.ListId);
    if (!list || list.childId !== childId) {
      return { statusCode: ERR_LIST_NOT_FOUND, statusMsg: '단어장을 찾을 수 없습니다.' };
    }

    const wordResults: any[] = [];
    let correctCount = 0;

    for (const ans of dto.Answers) {
      const word = await this.wordRepo.getById(ans.WordId);
      if (!word) continue;

      let correctAnswer: string;
      let question: string;

      if (dto.TestType === TEST_TYPE.BLANK) {
        correctAnswer = word.english;
        question = this.maskWord(word.english);
      } else if (dto.Mode === MEANING_TEST_MODE.MEANING_TO_WORD) {
        correctAnswer = word.english;
        question = word.meaning;
      } else {
        correctAnswer = word.meaning;
        question = word.english;
      }

      const isCorrect = ans.UserAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      if (isCorrect) correctCount++;

      wordResults.push({
        wordId: ans.WordId,
        question,
        userAnswer: ans.UserAnswer,
        correctAnswer,
        isCorrect,
      });
    }

    const totalQuestions = wordResults.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // 100점이면 포인트 지급
    let pointsEarned = 0;
    if (score === 100) {
      pointsEarned = POINT_PERFECT_SCORE;
      await this.userRepo.updatePoints(childId, POINT_PERFECT_SCORE);
      wLogger.log(`100점 포인트 지급 | childId: ${childId}, points: ${POINT_PERFECT_SCORE}`);
    }

    const result = await this.testResultRepo.insertResult({
      childId,
      listId: dto.ListId,
      testType: dto.TestType,
      mode: dto.Mode,
      score,
      pointsEarned,
      totalQuestions,
      correctCount,
      wordResults: wordResults.map((r) => ({ ...r })),
    });

    wLogger.log(`시험 제출 | childId: ${childId}, listId: ${dto.ListId}, score: ${score}`);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: { ...result, wordResults } };
  }

  async getTestHistory(childId: number, listId?: number) {
    const results = listId
      ? await this.testResultRepo.getByChildAndList(childId, listId)
      : await this.testResultRepo.getByChildId(childId);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: results };
  }

  async getTestDetail(childId: number, testId: number) {
    const result = await this.testResultRepo.getDetailById(testId);
    if (!result || result.childId !== childId) {
      return { statusCode: ERR_LIST_NOT_FOUND, statusMsg: '시험 결과를 찾을 수 없습니다.' };
    }
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: result };
  }

  // 부모용: 자녀 시험 히스토리 조회
  async getChildTestHistory(childId: number) {
    const results = await this.testResultRepo.getByChildId(childId);
    return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: results };
  }

  /**
   * 단어의 40~60%를 '_'로 마스킹
   * 너무 짧은 단어는 최소 1글자 보여줌
   */
  private maskWord(word: string): string {
    const letters = word.split('');
    const totalLen = letters.length;
    const maskCount = Math.max(1, Math.floor(totalLen * 0.5));
    // 무작위 위치를 골라 마스킹 (공백 제외)
    const eligibleIdx = letters.map((c, i) => (c !== ' ' ? i : -1)).filter((i) => i !== -1);
    const toMask = new Set<number>();
    while (toMask.size < Math.min(maskCount, eligibleIdx.length)) {
      toMask.add(eligibleIdx[Math.floor(Math.random() * eligibleIdx.length)]);
    }
    return letters.map((c, i) => (toMask.has(i) ? '_' : c)).join('');
  }
}
