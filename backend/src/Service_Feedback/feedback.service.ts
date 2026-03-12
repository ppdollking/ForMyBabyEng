import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { TestResultRepository } from '../Service_Test/Repository/TestResult.repository';
import { STATUS_SUCC, ERR_TEST_NOT_FOUND } from '../DefsEnum';
import { wLogger } from '../util/logger/logger.winston.util';

export interface FeedbackResult {
  summary: string;         // 전체 요약 (1~2문장)
  weakPoints: string[];    // 취약 패턴 목록
  studyTips: string[];     // 학습 조언 목록
  encouragement: string;   // 격려 메시지
}

@Injectable()
export class FeedbackService {
  private readonly client: Anthropic;

  constructor(
    private readonly config: ConfigService,
    private readonly testResultRepo: TestResultRepository,
  ) {
    this.client = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generateFeedback(childId: number, testId: number) {
    const result = await this.testResultRepo.getDetailById(testId);
    if (!result || result.childId !== childId) {
      return { statusCode: ERR_TEST_NOT_FOUND, statusMsg: '시험 결과를 찾을 수 없습니다.' };
    }

    const wrongWords = result.wordResults?.filter((w) => !w.isCorrect) ?? [];
    const correctWords = result.wordResults?.filter((w) => w.isCorrect) ?? [];

    // 모두 맞혔으면 간단한 칭찬 피드백 반환
    if (wrongWords.length === 0) {
      return {
        statusCode: STATUS_SUCC,
        statusMsg: 'ok',
        data: {
          summary: '모든 문제를 맞혔어요! 정말 훌륭해요.',
          weakPoints: [],
          studyTips: ['현재 단어장을 완전히 외웠어요! 새로운 단어장에 도전해 보세요.'],
          encouragement: '완벽한 점수예요! 계속 이 기세를 유지해요 🎉',
        } as FeedbackResult,
      };
    }

    const wrongList = wrongWords
      .map((w) => `- 문제: "${w.question}" / 내 답: "${w.userAnswer}" / 정답: "${w.correctAnswer}"`)
      .join('\n');

    const correctList = correctWords.map((w) => `"${w.correctAnswer}"`).join(', ');

    const prompt = `당신은 초등학생을 위한 영어 선생님입니다. 아이의 영어 단어 시험 결과를 분석해서 따뜻하고 격려하는 방식으로 피드백을 작성해 주세요.

[시험 정보]
- 시험 유형: ${result.testType === 'blank' ? '빈칸 채우기' : '뜻↔단어 매칭'}
- 점수: ${result.score}점 (${result.correctCount}/${result.totalQuestions}개 정답)

[틀린 문제]
${wrongList}

[맞힌 단어]
${correctList || '없음'}

아래 JSON 형식으로 한국어 피드백을 작성해 주세요:
{
  "summary": "전체 결과에 대한 한 두 문장 요약",
  "weakPoints": ["취약한 패턴이나 단어 유형 (2~3개)"],
  "studyTips": ["구체적인 학습 방법 (2~3개)"],
  "encouragement": "아이를 격려하는 짧은 메시지"
}`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        thinking: { type: 'adaptive' },
        messages: [{ role: 'user', content: prompt }],
      });

      // thinking 블록을 제외하고 text 블록만 추출
      const textBlock = response.content.find((b) => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('텍스트 응답이 없습니다.');
      }

      // JSON 파싱 (마크다운 코드블록 제거)
      const cleaned = textBlock.text.replace(/```json\n?|\n?```/g, '').trim();
      const feedback: FeedbackResult = JSON.parse(cleaned);

      wLogger.log(`피드백 생성 완료 | childId: ${childId}, testId: ${testId}, score: ${result.score}`);
      return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: feedback };
    } catch (e) {
      wLogger.error(`피드백 생성 실패 | testId: ${testId}, error: ${e?.message}`);
      return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: this.fallbackFeedback(result.score, wrongWords.length) };
    }
  }

  // Claude API 실패 시 기본 피드백 반환
  private fallbackFeedback(score: number, wrongCount: number): FeedbackResult {
    return {
      summary: `${score}점을 받았어요. ${wrongCount}개 단어를 다시 복습해 봐요.`,
      weakPoints: ['틀린 단어들을 다시 한번 살펴보세요.'],
      studyTips: ['틀린 단어를 소리 내어 읽어 보세요.', '단어 카드를 만들어 반복 학습해 보세요.'],
      encouragement: score >= 80 ? '잘했어요! 조금만 더 노력하면 완벽해질 거예요 💪' : '포기하지 마세요! 반복이 실력을 만들어요 😊',
    };
  }
}
