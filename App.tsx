import React, { useState, useEffect } from 'react';
import { ViewState, QARecord } from './types';
import { getStoredRecords, saveStoredRecords } from './services/storage';
import EnterData from './components/EnterData';
import EditData from './components/EditData';
import RetrieveData from './components/RetrieveData';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.ENTER);
  const [records, setRecords] = useState<QARecord[]>([]);

  // Load records on mount
  useEffect(() => {
    const stored = getStoredRecords();
    setRecords(stored);
  }, []);

  // Handler to add a new record
  const handleAddRecord = (record: QARecord) => {
    const updatedRecords = [...records, record];
    setRecords(updatedRecords);
    saveStoredRecords(updatedRecords);
  };

  // Handler to update a specific record
  const handleUpdateRecord = (updatedRecord: QARecord) => {
    const updatedRecords = records.map(r => 
      r.id === updatedRecord.id ? updatedRecord : r
    );
    setRecords(updatedRecords);
    saveStoredRecords(updatedRecords);
  };

  // Handler to delete a record
  const handleDeleteRecord = (id: string) => {
    const updatedRecords = records.filter(r => r.id !== id);
    setRecords(updatedRecords);
    saveStoredRecords(updatedRecords);
  };

  // Handler to bulk update (from CSV)
  const handleBulkUpdate = (newRecords: QARecord[]) => {
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  return (
    <div className="max-w-[900px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden my-0 md:my-5">
      
      {/* Header */}
      <header className="bg-gradient-to-br from-kp-red-dark via-kp-red-medium to-kp-red-light text-white p-5 text-center">
        <h1 className="text-2xl md:text-3xl font-bold">KP Astrology</h1>
      </header>

      {/* Navigation */}
      <nav className="flex flex-col md:flex-row bg-gradient-to-br from-kp-red-nav to-kp-red-nav2 border-b-2 border-kp-red-dark">
        <button
          onClick={() => setView(ViewState.ENTER)}
          className={`flex-1 p-4 text-white text-base md:text-lg transition-all duration-300 border-b md:border-b-0 border-kp-red-dark last:border-b-0
            ${view === ViewState.ENTER ? 'bg-gradient-to-br from-kp-red-light to-[#ff8787] shadow-inner font-semibold' : 'hover:bg-kp-red-dark'}`}
        >
          Enter Data
        </button>
        <button
          onClick={() => setView(ViewState.EDIT)}
          className={`flex-1 p-4 text-white text-base md:text-lg transition-all duration-300 border-b md:border-b-0 border-kp-red-dark last:border-b-0
            ${view === ViewState.EDIT ? 'bg-gradient-to-br from-kp-red-light to-[#ff8787] shadow-inner font-semibold' : 'hover:bg-kp-red-dark'}`}
        >
          Edit Data
        </button>
        <button
          onClick={() => setView(ViewState.RETRIEVE)}
          className={`flex-1 p-4 text-white text-base md:text-lg transition-all duration-300 border-b md:border-b-0 border-kp-red-dark last:border-b-0
            ${view === ViewState.RETRIEVE ? 'bg-gradient-to-br from-kp-red-light to-[#ff8787] shadow-inner font-semibold' : 'hover:bg-kp-red-dark'}`}
        >
          Retrieve Data
        </button>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-8 min-h-[400px]">
        {view === ViewState.ENTER && (
          <EnterData onAddRecord={handleAddRecord} records={records} />
        )}
        
        {view === ViewState.EDIT && (
          <EditData 
            records={records} 
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onBulkUpdate={handleBulkUpdate}
          />
        )}
        
        {view === ViewState.RETRIEVE && (
          <RetrieveData records={records} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-kp-red-dark via-kp-red-medium to-kp-red-light text-white text-center p-4 text-sm mt-5">
        Institute of KP Astrology ©️ AmannG
      </footer>
    </div>
  );
};

export default App;