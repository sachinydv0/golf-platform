import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e1e',
            color:      '#f0f0f0',
            border:     '1px solid rgba(255,255,255,0.1)',
            borderRadius:'12px',
            fontSize:   '14px',
          },
          success: { iconTheme: { primary: '#00cc7f', secondary: '#0d0d0d' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#0d0d0d' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
