import React, { useState, useMemo } from 'react';
import { generateId } from '../services/storage';
import { QARecord } from '../types';

interface EnterDataProps {
  onAddRecord: (record: QARecord) => void;
  records: QARecord[];
}

const EnterData: React.FC<EnterDataProps> = ({ onAddRecord, records }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Search state for checking existing records
  const [searchTerm, setSearchTerm] = useState('');

  // Filter existing records based on search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerTerm = searchTerm.toLowerCase();
    return records.filter(r => r.question.toLowerCase().includes(lowerTerm));
  }, [records, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setMessage({ text: 'Both question and answer are required.', type: 'error' });
      return;
    }

    // Check for exact duplicates
    const isDuplicate = records.some(
        r => r.question.trim().toLowerCase() === question.trim().toLowerCase()
    );

    if (isDuplicate) {
        if (!window.confirm("A record with this exact question already exists. Do you want to create a duplicate?")) {
            return;
        }
    }

    const newRecord: QARecord = {
      id: generateId(),
      question: question.trim(),
      answer: answer.trim(),
    };

    onAddRecord(newRecord);
    setQuestion('');
    setAnswer('');
    setSearchTerm(''); // Optional: clear search on save
    setMessage({ text: 'Record saved successfully!', type: 'success' });

    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Enter New Record</h2>

      {/* Search Existing Records Section */}
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <label htmlFor="check-existing" className="block mb-2 font-semibold text-blue-800 text-sm uppercase tracking-wide">
          Search Existing Questions
        </label>
        <div className="relative">
          <input
            id="check-existing"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type keywords to check if question exists..."
            className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-kp-blue focus:border-transparent text-sm"
          />
        </div>

        {searchTerm.trim() && (
          <div className="mt-3">
            {filteredRecords.length > 0 ? (
              <div className="bg-white rounded border border-blue-100 max-h-48 overflow-y-auto">
                <div className="p-2 bg-blue-100 text-xs font-semibold text-blue-800 sticky top-0">
                  Found {filteredRecords.length} matching record(s):
                </div>
                <ul className="divide-y divide-gray-100">
                  {filteredRecords.map(record => (
                    <li key={record.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="font-medium text-gray-800 text-sm mb-1">{record.question}</div>
                      <div className="text-gray-500 text-xs truncate">{record.answer}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mt-2">No matching questions found.</p>
            )}
          </div>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded border ${message.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="enter-question" className="block mb-2 font-semibold text-gray-700">
            Question
            <span className="text-gray-500 font-normal text-sm ml-2">({question.length} chars)</span>:
          </label>
          <textarea
            id="enter-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-kp-teal focus:border-transparent min-h-[100px]"
          />
        </div>

        <div>
          <label htmlFor="enter-answer" className="block mb-2 font-semibold text-gray-700">
            Answer
            <span className="text-gray-500 font-normal text-sm ml-2">({answer.length} chars)</span>:
          </label>
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