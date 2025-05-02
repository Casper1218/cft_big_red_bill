import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BillItem {
  name: string;
  price: number;
  payers: string[];
}

interface BillSplitContextType {
  receiver: string;
  items: BillItem[];
  payers: string[];
  setBillSplit: (receiver: string, items: BillItem[], payers: string[]) => void;
  clearBillSplit: () => void;
}

const BillSplitContext = createContext<BillSplitContextType | undefined>(undefined);

export const BillSplitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [receiver, setReceiver] = useState<string>('');
  const [items, setItems] = useState<BillItem[]>([]);
  const [payers, setPayers] = useState<string[]>([]);

  const setBillSplit = (newReceiver: string, newItems: BillItem[], newPayers: string[]) => {
    setReceiver(newReceiver);
    setItems(newItems);
    setPayers(newPayers);
  };

  const clearBillSplit = () => {
    setReceiver('');
    setItems([]);
    setPayers([]);
  };

  return (
    <BillSplitContext.Provider value={{ receiver, items, payers, setBillSplit, clearBillSplit }}>
      {children}
    </BillSplitContext.Provider>
  );
};

export const useBillSplit = () => {
  const context = useContext(BillSplitContext);
  if (context === undefined) {
    throw new Error('useBillSplit must be used within a BillSplitProvider');
  }
  return context;
}; 