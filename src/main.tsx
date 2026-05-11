import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

registerSW({ 
  immediate: true,
  onRegistered(r) {
    console.log('SW Registered:', r);
  },
  onRegisterError(error) {
    console.error('SW registration error', error);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
