'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import CelebrationOverlay from '@/components/CelebrationOverlay';
import FeedbackCard from '@/components/FeedbackCard';
import { testApi } from '@/lib/api';
import { setAuth, getUser, getToken } from '@/lib/auth';
import { userApi } from '@/lib/api';

interface Question {
  wordId: number;
  question: string;
  hint: string | null;
  answer: string;
}

type TestStep = 'options' | 'testing' | 'result';

interface TestResult {
  id: number;
  score: number;
  pointsEarned: number;
  correctCount: number;
  totalQuestions: number;
  wordResults: {
    wordId: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

export default function TestPage() {
  const { user, loading } = useAuth('child');
  const params = useParams();
  const router = useRouter();
  const listId = Number(params.listId);

  const [step, setStep] = useState<TestStep>('options');
  const [testType, setTestType] = useState<'blank' | 'meaning'>('blank');
  const [mode, setMode] = useState<'meaning_to_word' | 'word_to_meaning'>('meaning_to_word');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);

  const startTest = async () => {
    setLoadingTest(true);
    try {
      const res = await testApi.generate(listId, testType, mode);
      const data = res.data?.data;
      if (!data?.questions?.length) {
        alert('단어장에 단어가 없습니다.');
        return;
      }
      setQuestions(data.questions);
      setAnswers({});
      setCurrentQ(0);
      setStep('testing');
    } catch {
      alert('시험 준비 중 오류가 발생했습니다.');
    } finally {
      setLoadingTest(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersArr = questions.map((q) => ({
        WordId: q.wordId,
        UserAnswer: answers[q.wordId] ?? '',
      }));
      const res = await testApi.submit({
        ListId: listId,
        TestType: testType,
        Mode: mode,
        Answers: answersArr,
      });
      const data = res.data?.data;
      setResult(data);
      // 포인트가 바뀌었으면 로컬 스토리지 업데이트
      if (data.pointsEarned > 0) {
        const me = await userApi.me();
        const currentUser = getUser();
        if (currentUser && me.data?.data) {
          setAuth(getToken()!, { ...currentUser, points: me.data.data.points });
        }
      }
      setStep('result');
      if (data.score >= 80) setShowCelebration(true);
    } catch {
      alert('제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // 시험 옵션 선택 화면
  if (step === 'options') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow p-8"
          >
            <h1 className="text-2xl font-bold text-gray-800 mb-6">시험 옵션 선택</h1>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-600 mb-2">시험 방식</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTestType('blank')}
                    className={`py-3 px-4 rounded-xl border-2 font-semibold transition text-sm ${
                      testType === 'blank'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    ✏️ 빈칸 채우기
                  </button>
                  <button
                    onClick={() => setTestType('meaning')}
                    className={`py-3 px-4 rounded-xl border-2 font-semibold transition text-sm ${
                      testType === 'meaning'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    💬 뜻↔단어
                  </button>
                </div>
              </div>

              {testType === 'meaning' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="font-semibold text-gray-600 mb-2">뜻↔단어 모드</p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setMode('meaning_to_word')}
                      className={`py-3 px-4 rounded-xl border-2 font-semibold transition text-sm ${
                        mode === 'meaning_to_word'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      뜻 → 영어 단어 쓰기
                    </button>
                    <button
                      onClick={() => setMode('word_to_meaning')}
                      className={`py-3 px-4 rounded-xl border-2 font-semibold transition text-sm ${
                        mode === 'word_to_meaning'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      영어 단어 → 뜻 쓰기
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700">
                <p className="font-semibold mb-1">채점 기준</p>
                <p>80점 이상 🎉 축하 이벤트</p>
                <p>100점 🏆 +10 포인트 지급!</p>
              </div>

              <button
                onClick={startTest}
                disabled={loadingTest}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition text-lg"
              >
                {loadingTest ? '준비 중...' : '시험 시작!'}
              </button>
              <button onClick={() => router.back()} className="w-full py-3 text-gray-400 hover:text-gray-600 transition text-sm">
                돌아가기
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // 시험 진행 화면
  if (step === 'testing') {
    const q = questions[currentQ];
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">
              {currentQ + 1} / {questions.length}
            </p>
            <div className="bg-gray-200 rounded-full h-2 flex-1 mx-4">
              <motion.div
                className="bg-indigo-500 h-2 rounded-full"
                animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-white rounded-2xl shadow p-8 mb-4"
            >
              <p className="text-gray-500 text-sm mb-2">
                {testType === 'blank' ? '빈칸을 채워보세요' : mode === 'meaning_to_word' ? '뜻을 보고 영어 단어를 쓰세요' : '영어 단어를 보고 뜻을 쓰세요'}
              </p>
              <p className="text-3xl font-bold text-gray-800 mb-6">{q.question}</p>
              {q.hint && <p className="text-indigo-400 text-sm mb-4">힌트: {q.hint}</p>}
              <input
                type="text"
                placeholder="답을 입력하세요"
                value={answers[q.wordId] ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.wordId]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && currentQ < questions.length - 1) setCurrentQ((prev) => prev + 1);
                }}
                autoFocus
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg"
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3">
            {currentQ > 0 && (
              <button
                onClick={() => setCurrentQ((prev) => prev - 1)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
              >
                이전
              </button>
            )}
            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ((prev) => prev + 1)}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-60 transition"
              >
                {submitting ? '채점 중...' : '제출하기'}
              </button>
            )}
          </div>

          {/* 전체 문제 미리보기 점 */}
          <div className="flex gap-1.5 justify-center mt-4 flex-wrap">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-3 h-3 rounded-full transition ${
                  answers[q.wordId] ? 'bg-indigo-400' : i === currentQ ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showCelebration && (
          <CelebrationOverlay
            score={result.score}
            pointsEarned={result.pointsEarned}
            onClose={() => setShowCelebration(false)}
          />
        )}
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow p-8 mb-6 text-center">
            <p className="text-6xl mb-4">{result.score >= 80 ? '🎉' : '📝'}</p>
            <p className="text-5xl font-extrabold text-indigo-600 mb-2">{result.score}점</p>
            <p className="text-gray-500">{result.correctCount}/{result.totalQuestions}개 정답</p>
            {result.pointsEarned > 0 && (
              <p className="text-yellow-500 font-bold mt-2">+{result.pointsEarned} 포인트 획득!</p>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {result.wordResults.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-xl shadow p-4 border-l-4 ${r.isCorrect ? 'border-green-400' : 'border-red-400'}`}
              >
                <p className="text-gray-500 text-xs">{r.question}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`font-bold ${r.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                    {r.userAnswer || '(미답변)'}
                  </span>
                  {!r.isCorrect && (
                    <span className="text-gray-400 text-sm">→ 정답: <strong>{r.correctAnswer}</strong></span>
                  )}
                  <span className="ml-auto">{r.isCorrect ? '✅' : '❌'}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI 학습 피드백 */}
          <FeedbackCard testId={result.id} />

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setStep('options'); setResult(null); }}
              className="flex-1 py-3 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition font-semibold"
            >
              다시 풀기
            </button>
            <button
              onClick={() => router.replace('/child/home')}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <LoadingSpinner />;
}
