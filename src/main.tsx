import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// BuildXpc - Hardware Enthusiast Platform
// NOTE: This project does NOT use MetaMask or any Web3/Blockchain technology.
// We suppress noise from external browser extensions (like MetaMask) to keep the console clean.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || event.reason?.toString() || '';
    if (reason.includes('MetaMask') || reason.includes('WebSocket') || reason.includes('ethereum')) {
      event.preventDefault();
    }
  });

  const originalError = console.error;
  console.error = (...args) => {
    const msg = args.map(arg => {
      try {
        return typeof arg === 'string' ? arg : JSON.stringify(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');

    const noiseKeywords = [
      'MetaMask', 
      'ethereum', 
      'web3', 
      'extension', 
      '[vite] failed to connect to websocket',
      'WebSocket closed without opened'
    ];

    if (noiseKeywords.some(keyword => msg.includes(keyword))) {
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
