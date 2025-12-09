export interface QARecord {
  id: string;
  question: string;
  answer: string;
}

export enum ViewState {
  ENTER = 'ENTER',
  EDIT = 'EDIT',
  RETRIEVE = 'RETRIEVE',
}