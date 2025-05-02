import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BillItem } from './BillSplitContext';
import { ProcessedBill } from '../utils/ocr';

interface RawBillDataContextType {
  rawBillData: ProcessedBill;
  setBillData: (rawBillData: ProcessedBill) => void;
}



const RawBillDataContext = createContext<RawBillDataContextType | undefined>(undefined);

export const RawBillDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rawBillData, setRawBillData] = useState<ProcessedBill | null>(null);

  const setBillData = (newRawBillData: ProcessedBill) => {
    setRawBillData(newRawBillData);
  };



  return (
    <RawBillDataContext.Provider value={{ rawBillData, setBillData }}>
      {children}
    </RawBillDataContext.Provider>
  );
};

export const useRawBillData = () => {
  const context = useContext(RawBillDataContext);
  if (context === undefined) {
    throw new Error('useRawBillData must be used within a RawBillDataProvider');
  }
  return context;
}; 