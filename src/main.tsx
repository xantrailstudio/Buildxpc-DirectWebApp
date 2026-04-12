import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// BuildXpc - Hardware Enthusiast Platform
// NOTE: This project does NOT use MetaMask or any Web3/Blockchain technology.
// Any MetaMask errors are caused by browser extensions injecting code into the page.
if (typeof window !== 'undefined') {
  // Aggressively neutralize MetaMask injection to prevent unwanted connection attempts
  // Use a Proxy to catch any attempts to access or modify the ethereum object
  const nullProxy = new Proxy({}, {
    get: () => undefined,
    set: () => true,
    apply: () => undefined,
    construct: () => ({})
  });

  try {
    Object.defineProperty(window, 'ethereum', {
      value: nullProxy,
      writable: false,
      configurable: false
    });
  } catch (e) {
    (window as any).ethereum = nullProxy;
  }
  
  window.addEventListener('unhandledrejection', (event) => {
    // Silently ignore errors from external browser extensions (MetaMask, Vite HMR)
    const reason = event.reason?.message || event.reason?.toString() || '';
    if (reason.includes('MetaMask') || reason.includes('WebSocket') || reason.includes('ethereum')) {
      event.preventDefault();
    }
  });

  // Filter console noise from external extensions
  const originalError = console.error;
  console.error = (...args) => {
    const msg = args[0]?.toString() || '';
    if (msg.includes('MetaMask') || msg.includes('[vite] failed to connect to websocket') || msg.includes('ethereum')) {
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
