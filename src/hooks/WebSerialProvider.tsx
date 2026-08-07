import React, { createContext, useContext } from 'react';
import { useWebSerialClickers } from './useWebSerialClickers';

const WebSerialContext = createContext<ReturnType<typeof useWebSerialClickers> | null>(null);

export const WebSerialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const serial = useWebSerialClickers();
  return <WebSerialContext.Provider value={serial}>{children}</WebSerialContext.Provider>;
};

export const useGlobalWebSerial = () => {
  const context = useContext(WebSerialContext);
  if (!context) {
    throw new Error('useGlobalWebSerial must be used within a WebSerialProvider');
  }
  return context;
};
