'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Props {
  score: number;
  pointsEarned: number;
  onClose: () => void;
}

export default function CelebrationOverlay({ score, pointsEarned, onClose }: Props) {
  useEffect(() => {
    if (score === 100) {
      // 100점: 연속 폭죽
      const duration = 3000;
      const end = Date.now() + duration;
      const interval = setInterval(() => {
        if (Date.now() > end) { clearInterval(interval); return; }
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        confetti({ particleCount: 60, spread: 80, origin: { x: 0, y: 0.6 } });
        confetti({ particleCount: 60, spread: 80, origin: { x: 1, y: 0.6 } });
      }, 300);
    } else {
      // 80점 이상: 단발 폭죽
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
  }, [score]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-sm mx-4"
      >
        <div className="text-6xl mb-4">{score === 100 ? '🏆' : '🎉'}</div>
        <h2 className="text-4xl font-extrabold text-indigo-600 mb-2">{score}점!</h2>
        {score === 100 && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-yellow-500 font-bold text-lg mb-2"
          >
            ⭐ +{pointsEarned} 포인트 획득!
          </motion.div>
        )}
        <p className="text-gray-500 mb-6">
          {score === 100 ? '완벽해요! 최고예요!' : '잘했어요! 계속 연습해요!'}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
        >
          결과 보기
        </button>
      </motion.div>
    </div>
  );
}
