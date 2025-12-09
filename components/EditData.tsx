import React, { useState, useRef, useMemo } from 'react';
import { QARecord } from '../types';
import { parseCsvContent } from '../services/csv';

interface EditDataProps {
  records: QARecord[];
  onUpdateRecord: (record: QARecord) => void;
  onBulkUpdate: (records: QARecord[]) => void;
}

const EditData: React.FC<EditDataProps> = ({ records, onUpdateRecord, onBulkUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ question: string; answer: string }>({ question: '', answer: '' });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFormRef = useRef<HTMLDivElement>(null);

  const filteredRecords = useMemo(() => {
    if (!searchTriggered) return [];
    if (!searchTerm.trim()) return records;
    const lowerTerm = searchTerm.toLowerCase();
    return records.filter(r => r.question.toLowerCase().includes(lowerTerm));
  }, [records, searchTerm, searchTriggered]);

  const handleSearch = () => {
    setSearchTriggered(true);
    setEditingId(null);
  };

  const handleShowAll = () => {
    setSearchTerm('');
    setSearchTriggered(true);
    setEditingId(null);
  };

  const startEditing = (record: QARecord) => {
    setEditingId(record.id);
    setEditForm({ question: record.question, answer: record.answer });
    setTimeout(() => {
        editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ question: '', answer: '' });
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!editForm.question.trim() || !editForm.answer.trim()) {
      setMessage({ text: 'Both question and answer are required.', type: 'error' });
      return;
    }

    onUpdateRecord({
      id: editingId,
      question: editForm.question.trim(),
      answer: editForm.answer.trim()
    });

    setMessage({ text: 'Record updated successfully!', type: 'success' });
    setTimeout(() => setMessage(null), 4000);
    setEditingId(null);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const result = parseCsvContent(text, records);
        if (result) {
          onBulkUpdate(result.updatedRecords);
          setMessage({ 
            text: `Bulk upload complete: ${result.addedCount} added, ${result.updatedCount} updated.`, 
            type: 'success' 
          });
          setSearchTriggered(true); // Refresh view
        }
      } catch (err: any) {
        setMessage({ text: err.message || 'Failed to process CSV.', type: 'error' });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Edit Records</h2>

      {message && (
        <div className={`p-3 rounded border ${message.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by keyword in question..."
          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-kp-teal focus:border-transparent"
        />
        <button onClick={handleSearch} className="bg-kp-blue hover:bg-kp-blue-dark text-white px-4 py-2 rounded transition-colors">
          Search
        </button>
        <button onClick={handleShowAll} className="bg-kp-blue hover:bg-kp-blue-dark text-white px-4 py-2 rounded transition-colors">
          Show All
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="bg-kp-teal hover:bg-kp-teal-dark text-white px-4 py-2 rounded transition-colors">
          Bulk Upload CSV
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv,text/csv" 
            className="hidden" 
            onChange={handleCsvUpload} 
        />
      </div>

      {/* Results List */}
      <div className="space-y-4 mt-6">
        {searchTriggered && filteredRecords.length === 0 && (
          <div className="text-center text-gray-500 py-10">No matching records found.</div>
        )}

        {searchTriggered && filteredRecords.map(record => (
          <div key={record.id} className="bg-gray-50 p-4 rounded border border-gray-200 shadow-sm break-words">
            <h3 className="font-semibold text-gray-800 mb-2">{record.question}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{record.answer}</p>
            <button 
                onClick={() => startEditing(record)}
                className="text-xs bg-kp-teal hover:bg-kp-teal-dark text-white px-3 py-1 rounded transition-colors"
            >
                Edit
            </button>
          </div>
        ))}
      </div>

      {/* Edit Form Modal/Section */}
      {editingId && (
        <div ref={editFormRef} className="bg-gray-100 p-6 rounded-lg border border-gray-200 mt-8 animate-fade-in">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Record</h3>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">Question:</label>
            <textarea
              value={editForm.question}
              onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-kp-teal focus:border-transparent min-h-[80px]"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">Answer:</label>
            <textarea
              value={editForm.answer}
              onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-kp-teal focus:border-transparent min-h-[100px]"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={saveEdit} className="bg-kp-teal hover:bg-kp-teal-dark text-white px-6 py-2 rounded transition-colors">
                Save Changes
            </button>
            <button onClick={cancelEditing} className="bg-kp-blue hover:bg-kp-blue-dark text-white px-6 py-2 rounded transition-colors">
                Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditData;