'use client'
import { useState, createContext, useContext, ReactNode } from 'react';

// Define all the types we need
export type ChildInfo = {
  name: string;
  gender: string;
  age: string;
  ethnicity: string;
};

export type AssessData = {
  street: string;
  city: string;
  state: string;
  address: string;
  income: string;
  country: string;
  isEmployed: boolean;
  children: ChildInfo[];
  opportunityScore?: number | null;
};

interface AssessContextType {
  data: AssessData;
  updateData: (data: Partial<AssessData>) => void;
  setFullData: (data: AssessData) => void;
}

// Initial default values
const defaultData: AssessData = {
  street: '',
  city: '',
  state: '',
  address: '',
  income: '',
  country: '',
  isEmployed: false,
  children: [],
  opportunityScore: null
};

const AssessContext = createContext<AssessContextType | undefined>(undefined);

export function AssessProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AssessData>(defaultData);

  const updateData = (newData: Partial<AssessData>) => {
    setData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  const setFullData = (newData: AssessData) => {
    setData(newData);
  };

  return (
    <AssessContext.Provider value={{ data, updateData, setFullData }}>
      {children}
    </AssessContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessProvider');
  }
  return context;
}

// Alias for backward compatibility
export const usePersonalization = useAssessment;

// Alias for backward compatibility
export { AssessProvider as PersonalizationProvider };
