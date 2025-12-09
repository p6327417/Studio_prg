import { QARecord } from '../types';

const STORAGE_KEY = 'qaRecords';

export const getStoredRecords = (): QARecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse records from localStorage', error);
    return [];
  }
};

export const saveStoredRecords = (records: QARecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save records to localStorage', error);
  }
};

export const generateId = (): string => {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};