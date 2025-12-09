import { QARecord } from '../types';
import { generateId } from './storage';

// Helper to escape CSV values
const csvEscape = (value: string | null | undefined): string => {
  if (value == null) return '';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

// Helper to parse a single CSV line handling quotes
const parseCsvRow = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

export const generateCsvContent = (records: QARecord[]): string => {
  const header = ['ID', 'Question', 'Answer'];
  const rows = [header.join(',')];

  records.forEach(record => {
    const row = [
      csvEscape(record.id),
      csvEscape(record.question),
      csvEscape(record.answer)
    ];
    rows.push(row.join(','));
  });

  return rows.join('\r\n');
};

export const parseCsvContent = (text: string, currentRecords: QARecord[]): { updatedRecords: QARecord[], addedCount: number, updatedCount: number } | null => {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (!lines.length) return null;

  const records = [...currentRecords];
  let added = 0;
  let updated = 0;

  const firstRowCells = parseCsvRow(lines[0]);
  let hasHeader = firstRowCells.some(c => /question/i.test(c)) || firstRowCells.some(c => /answer/i.test(c));

  let startIndex = hasHeader ? 1 : 0;
  let idIdx = -1, qIdx = -1, aIdx = -1;

  // Determine column indices
  if (hasHeader) {
    firstRowCells.forEach((h, i) => {
      const hl = h.trim().toLowerCase();
      if (hl === 'id') idIdx = i;
      else if (hl === 'question') qIdx = i;
      else if (hl === 'answer') aIdx = i;
    });
  }

  // Fallback if no header detection worked perfectly but structure looks standard
  if (!hasHeader) {
    if (firstRowCells.length === 3) {
      idIdx = 0; qIdx = 1; aIdx = 2;
    } else if (firstRowCells.length === 2) {
      idIdx = -1; qIdx = 0; aIdx = 1;
    }
  }

  if (qIdx === -1 || aIdx === -1) {
    throw new Error('CSV must contain Question and Answer columns.');
  }

  for (let i = startIndex; i < lines.length; i++) {
    const row = parseCsvRow(lines[i]);
    if (!row.length) continue;

    const rawId = idIdx >= 0 ? (row[idIdx] || '').trim() : '';
    const question = (row[qIdx] || '').trim();
    const answer = (row[aIdx] || '').trim();

    if (!question || !answer) {
      continue;
    }

    if (rawId) {
      const idx = records.findIndex(r => r.id === rawId);
      if (idx >= 0) {
        records[idx] = { ...records[idx], question, answer };
        updated++;
      } else {
        records.push({
          id: rawId,
          question,
          answer
        });
        added++;
      }
    } else {
      records.push({
        id: generateId(),
        question,
        answer
      });
      added++;
    }
  }

  return { updatedRecords: records, addedCount: added, updatedCount: updated };
};