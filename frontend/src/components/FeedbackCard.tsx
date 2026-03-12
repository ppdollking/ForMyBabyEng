'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackApi } from '@/lib/api';

interface FeedbackResult {
  summary: string;
  weakPoints: string[];
  studyTips: string[];
  encouragement: string;
}

interface Props {
  testId: number;
}

export default function FeedbackCard({ testId }: Props) {
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await feedbackApi.generate(testId);
      const { statusCode, data, statusMsg } = res.data;
      if (statusCode !== 200) {
        setError(statusMsg);
        return;
      }
      setFeedback(data);
    } catch {
      setError('피드백을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {!feedback && (
        <button
          onClick={handleRequest}
          disabled={loading}
          className="w-full py-3 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 font-semibold hover:bg-indigo-50 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              AI 피드백 분석 중...
            </>
          ) : (
            <>✨ AI 학습 피드백 받기</>
          )}
        </button>
      )}

      {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 space-y-5"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🤖</span>
              <h3 className="font-bold text-indigo-700 text-lg">AI 학습 피드백</h3>
            </div>

            {/* 요약 */}
            <p className="text-gray-700 leading-relaxed">{feedback.summary}</p>

            {/* 취약 포인트 */}
            {feedback.weakPoints.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-1">
                  <span>⚠️</span> 취약 포인트
                </h4>
                <ul className="space-y-1">
                  {feedback.weakPoints.map((point, i) => (
                    <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 학습 조언 */}
            <div>
              <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-1">
                <span>💡</span> 학습 조언
              </h4>
              <ul className="space-y-1">
                {feedback.studyTips.map((tip, i) => (
                  <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* 격려 메시지 */}
            <div className="bg-white rounded-xl p-4 text-center border border-indigo-100">
              <p className="text-indigo-600 font-semibold">{feedback.encouragement}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
