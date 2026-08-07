import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { WebSerialProvider } from './hooks/WebSerialProvider';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <WebSerialProvider>
          <App />
        </WebSerialProvider>
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>,
);
