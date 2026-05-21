import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '0',
            fontSize: '12px',
            letterSpacing: '0.05em',
          },
          success: { iconTheme: { primary: '#C9A84C', secondary: '#000' } },
          error: { iconTheme: { primary: '#ff4444', secondary: '#000' } },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
