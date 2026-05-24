import { createContext, useContext, useState, ReactNode } from 'react';

interface SetupData {
  name: string;
  description: string;
  cuisine: string;
  logo: File | null;
  banner: File | null;
  themeColor: string;
  paymentMode: 'prepaid' | 'postpaid' | 'both';
  tableCount: number;
  tables: any[];
  admin: { name: string; phone: string; pin: string };
}

interface SetupContextType {
  data: SetupData;
  updateData: (newData: Partial<SetupData>) => void;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SetupData>({
    name: '',
    description: '',
    cuisine: '',
    logo: null,
    banner: null,
    themeColor: '#000000',
    paymentMode: 'prepaid',
    tableCount: 1,
    tables: [],
    admin: { name: '', phone: '', pin: '' }
  });

  const updateData = (newData: Partial<SetupData>) => setData({ ...data, ...newData });

  return (
    <SetupContext.Provider value={{ data, updateData }}>
      {children}
    </SetupContext.Provider>
  );
}

export const useSetup = () => {
  const context = useContext(SetupContext);
  if (!context) throw new Error('useSetup must be used within a SetupProvider');
  return context;
};
