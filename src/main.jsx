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
            background: '#fff',
            color: '#000',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: '0',
            fontSize: '12px',
            letterSpacing: '0.05em',
          },
          success: { iconTheme: { primary: '#A8751E', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ff4444', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);