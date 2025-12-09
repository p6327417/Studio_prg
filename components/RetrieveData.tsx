import React, { useState, useMemo, useEffect } from 'react';
import { QARecord } from '../types';
import { generateCsvContent } from '../services/csv';

interface RetrieveDataProps {
  records: QARecord[];
}

const RetrieveData: React.FC<RetrieveDataProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(true); // Default to showing all on load

  // Reset to "show all" when component mounts
  useEffect(() => {
    setSearchTerm('');
    setSearchTriggered(true);
  }, []);

  const filteredRecords = useMemo(() => {
    if (!searchTriggered) return [];
    if (!searchTerm.trim()) return records;
    const lowerTerm = searchTerm.toLowerCase();
    return records.filter(r => r.question.toLowerCase().includes(lowerTerm));
  }, [records, searchTerm, searchTriggered]);

  const handleSearch = () => {
    setSearchTriggered(true);
  };

  const handleShowAll = () => {
    setSearchTerm('');
    setSearchTriggered(true);
  };

  const handleDownloadCsv = () => {
    if (records.length === 0) {
      alert('No records found to download.');
      return;
    }

    const csvContent = generateCsvContent(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const filename = `kp_records_${yyyy}-${mm}-${dd}.csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Retrieve Records</h2>

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
        <button onClick={handleDownloadCsv} className="bg-kp-teal hover:bg-kp-teal-dark text-white px-4 py-2 rounded transition-colors">
          Download CSV
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {filteredRecords.length === 0 && (
          <div className="text-center text-gray-500 py-10">No matching records found.</div>
        )}

        {filteredRecords.map(record => (
          <div key={record.id} className="bg-gray-50 p-4 rounded border border-gray-200 shadow-sm break-words">
            <h3 className="font-semibold text-gray-800 mb-2">{record.question}</h3>
            <div className="text-gray-600 text-sm">
                <span className="font-semibold text-gray-700">Answer: </span>
                {record.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RetrieveData;