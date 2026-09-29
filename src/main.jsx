import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { SyncProvider } from './context/SyncContext.jsx';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SyncProvider>
        <App />
      </SyncProvider>
    </BrowserRouter>
  </StrictMode>
);
