import React, { useState } from 'react';
import { generateId } from '../services/storage';
import { QARecord } from '../types';

interface EnterDataProps {
  onAddRecord: (record: QARecord) => void;
}

const EnterData: React.FC<EnterDataProps> = ({ onAddRecord }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setMessage({ text: 'Both question and answer are required.', type: 'error' });
      return;
    }

    const newRecord: QARecord = {
      id: generateId(),
      question: question.trim(),
      answer: answer.trim(),
    };

    onAddRecord(newRecord);
    setQuestion('');
    setAnswer('');
    setMessage({ text: 'Record saved successfully!', type: 'success' });

    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Enter New Record</h2>

      {message && (
        <div className={`p-3 rounded border ${message.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="enter-question" className="block mb-2 font-semibold text-gray-700">Question:</label>
          <textarea
            id="enter-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-kp-teal focus:border-transparent min-h-[100px]"
          />
        </div>

        <div>
          <label htmlFor="enter-answer" className="block mb-2 font-semibold text-gray-700">Answer:</label>
          <textarea
            id="enter-answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer here..."
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-kp-teal focus:border-transparent min-h-[100px]"
          />
        </div>

        <button
          type="submit"
          className="bg-kp-teal hover:bg-kp-teal-dark text-white font-medium py-2 px-6 rounded transition-colors duration-200"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default EnterData;